# Start without the npm/Yarn dependencies bundled in the Node image.
FROM alpine:3.24 AS base
# Enforce the Alpine fix for CVE-2026-85091 even when FROM ships older zlib.
RUN apk upgrade --no-cache \
    && apk add --no-cache ca-certificates libstdc++ 'zlib>=1.3.2-r1' \
    && addgroup -g 1000 node \
    && adduser -u 1000 -G node -s /bin/sh -D node
COPY --from=node:24-alpine3.24 /usr/local/bin/node /usr/local/bin/node
RUN node --version

# npm is needed only to build/install the apps. Update it independently of Node.
FROM base AS build-base
COPY --from=node:24-alpine3.24 /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && npm install --global npm@12.2.0 --no-audit --no-fund

# Build the React app once; Nginx serves the resulting files at runtime.
FROM build-base AS client-build
ARG REACT_APP_API_BASE_URL=""
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY client/ ./
RUN npm run build

# Keep native Node build tools out of the runtime image.
FROM build-base AS backend-build
# bcrypt may need a native build; these tools stay in this build stage.
RUN apk add --no-cache python3 make g++
COPY --from=node:24-alpine3.24 /usr/local/include/node /usr/local/include/node
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
WORKDIR /app/botBackend
COPY botBackend/package.json botBackend/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM base AS runtime
ENV NODE_ENV=production \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:${PATH}" \
    CHROME_BIN=/usr/bin/chromium-browser \
    CHROMEDRIVER_PATH=/usr/bin/chromedriver \
    BOT_BACKEND_URL=http://127.0.0.1:3002

# Stable Alpine currently ships an older browser. Tag the browser repositories
# to get current Chromium security fixes and its matching driver.
RUN printf '%s\n' \
        '@browser-edge https://dl-cdn.alpinelinux.org/alpine/edge/main' \
        '@browser-edge https://dl-cdn.alpinelinux.org/alpine/edge/community' \
        >> /etc/apk/repositories \
    && apk add --no-cache \
        bash ca-certificates nginx tini python3 py3-pip \
        chromium@browser-edge chromium-chromedriver@browser-edge \
        'libexpat@browser-edge>=2.9.0-r0'
COPY botBackend/requirements.txt /tmp/requirements.txt
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir -r /tmp/requirements.txt \
    && /opt/venv/bin/pip uninstall --yes pip \
    && apk del --no-cache py3-pip \
    && rm /tmp/requirements.txt

WORKDIR /app
COPY --chown=node:node server/ ./server/
COPY --from=backend-build --chown=node:node /app/server/node_modules ./server/node_modules
COPY --chown=node:node botBackend/ ./botBackend/
COPY --from=backend-build --chown=node:node /app/botBackend/node_modules ./botBackend/node_modules
COPY --from=client-build --chown=node:node /app/client/build ./client/build
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --chown=node:node docker/ ./docker/
RUN chmod +x /app/docker/start.sh

USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD ["node", "/app/docker/healthcheck.mjs"]
ENTRYPOINT ["/sbin/tini", "-g", "--", "/app/docker/start.sh"]
