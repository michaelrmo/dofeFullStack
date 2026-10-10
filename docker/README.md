# Running all three apps in one container

Build from the repository root using the root `Dockerfile`. The existing
Dockerfiles in each app directory are not used by this setup.

The image runs `npm run build` for the client during the build. At runtime,
Nginx serves those production files, while `node index.js` runs in both
`server` and `botBackend`. Python, Selenium, Chromium and its matching driver
are included for the bot scripts. All processes log to the container output.

## Build and run locally

```bash
cp .env.example .env
# Fill in .env with your MongoDB, JWT and Stripe values.
docker build --pull --platform linux/amd64 -t botpulse:latest .
docker run --rm --name botpulse --env-file .env -p 8080:8080 botpulse:latest
```

Open <http://localhost:8080>. Environment files and local `node_modules` are
excluded from the image. Use values without surrounding quotes in `.env`
when passing it to Docker's `--env-file`.

If you already have working settings in `server/.env`, use those four values
in the root `.env`. Docker reads the file supplied to `--env-file`; it does
not automatically read `server/.env` inside the image. Keep the actual
connection string and credentials out of the Dockerfile.

Required runtime variables:

| Variable | Value |
| --- | --- |
| `MONGO_URL` | Connection string for an external MongoDB database |
| `JWT_SECRET` | Your JWT signing secret |
| `STRIPE_KEY` | Your Stripe secret API key |
| `ENDPOINT_SECRET` | Stripe signing secret for this deployment's webhook |

MongoDB is not bundled with the container. Its hostname must be reachable
from the hosting environment; `localhost` refers to this container. For
MongoDB Atlas, allow access from your Azure app's outbound addresses.

If startup reports `querySrv ENOTFOUND`, check that `MONGO_URL` contains your
actual cluster hostname. The old example `cluster.example.mongodb.net` is
not a database. An authentication failure instead means the database user,
password, or authentication database needs checking. For connection timeouts,
check Atlas Network Access and outbound networking. See
[MongoDB's connection troubleshooting guide](https://www.mongodb.com/docs/atlas/troubleshoot-connection/).

## Base images

All stages start from `alpine:3.24`, apply available Alpine package updates,
and copy only the Node executable from the official `node:24-alpine3.24`
image. The shared base does not inherit that image's bundled npm or Yarn
dependencies. npm 12.2.0 and Node headers are used only in build stages;
native compilation tools are installed only in the backend build stage.
The runtime contains no npm or Yarn, and pip is removed after installing
Selenium. The apps start directly with Node, and the bot scripts use the
populated Python virtual environment.

Chromium and its matching driver use tagged Alpine edge repositories for
newer browser security fixes than the stable repository currently provides.
These repositories can also supply libraries needed by the browser. Use
`--pull` when rebuilding to fetch the current base and Node executable;
use `--no-cache` as well when you need to refresh cached package updates.

The shared base explicitly requires `zlib>=1.3.2-r1`, the Alpine fix for
`CVE-2026-85091`. An editor can still warn on `FROM alpine:3.24` because the
upstream image ships `zlib` 1.3.2-r0. The package update runs when this image
is built; the editor's upstream-image warning can remain until Alpine
publishes an updated image. Check the built runtime directly:

```bash
docker run --rm --entrypoint sh botpulse:latest -c 'apk list --installed zlib'
```

Image vulnerability counts depend on the scanner and its advisory database.
Scan the final image as well as the base: the final image also contains
Chromium, Python packages, and the application's Node dependencies.

## Networking

Only port **8080** is public. Configure Azure to send HTTP traffic there;
Azure handles the public HTTPS certificate.

| Request | Destination |
| --- | --- |
| `/`, `/home`, and other frontend routes | Built React client |
| `/auth/*`, `/users/*`, `/assets/*` | Server on `127.0.0.1:3001` |
| `/stripe/*` | Stripe listener on `127.0.0.1:4242` |
| Server's bot launch requests | Bot backend on `127.0.0.1:3002` |
| `/healthz` | Server readiness, including its MongoDB connection |

The Docker build sets `REACT_APP_API_BASE_URL` to an empty string, so browser
requests use relative API URLs and the same image works with localhost,
an Azure hostname, or your custom domain. Bot requests stay inside the
container. `BOT_BACKEND_URL` can optionally point to a separate bot service;
the default is `http://127.0.0.1:3002`.

The internal ports are fixed by the startup script, so an Azure `PORT`
environment variable cannot make the backends collide. The Docker health
check verifies Nginx and all three backend listeners. If a service exits,
the other services stop and the container exits with a failure status.

For local development without Docker, `npm start` in `client` uses the
development proxy at `http://127.0.0.1:3001`.

Run `node index.js` in both `server` and `botBackend`, and `npm start` in
`client`. Restart both Node backends after editing their code; they do not
reload modules automatically. `BOT_BACKEND_URL` defaults to
`http://127.0.0.1:3002` for this setup. The bot backend uses `python3` from
`PATH`; set `PYTHON_BIN` to a virtual environment's Python executable if
needed. Local Python needs the packages from `botBackend/requirements.txt`,
plus Chromium and its matching driver. The Docker image supplies these.

A launch should log `Forwarding bot launch` in the main server and
`Bot launch received` / `Bot process started` in the bot backend. The launch
response confirms a process started; Python output records whether it joined
the game or subsequently failed. Only the Kahoot script currently exists;
requests for missing scripts, including Quizizz, return an error.

Standalone production builds (`npm run build` followed by a static file
server) default to the original API at `https://botpulse.xyz`. A static file
server does not proxy `/auth` or `/users`; it may return `index.html` with a
200 status for those requests. To use another API, set
`REACT_APP_API_BASE_URL=https://your-api-host` in `client/.env.local` before
building. Set it to an empty string only when the frontend host proxies the
API routes. React settings are compiled at build time; changing Azure runtime
variables does not update the already-built frontend bundle.

If needed, the Docker build can also target a separate API:

```bash
docker build --build-arg REACT_APP_API_BASE_URL=https://your-api-host -t botpulse:latest .
```

## Hosting on Azure

1. Push `botpulse:latest` to Azure Container Registry or another registry
   that your Azure hosting service can pull from. For an existing ACR:

   ```bash
   az acr login --name YOUR_REGISTRY
   docker tag botpulse:latest YOUR_REGISTRY.azurecr.io/botpulse:latest
   docker push YOUR_REGISTRY.azurecr.io/botpulse:latest
   ```

2. Create a Linux container app/web app using that image and configure its
   registry access. Keep the image's default startup command.
3. Add the four required variables above as runtime environment variables
   or secret references in Azure. Uploading the image does not upload `.env`.
4. Set the public HTTP target port to **8080**:
   - **Azure Container Apps:** enable external HTTP ingress with target port
     `8080`. Set a minimum of one replica if bots must keep running between
     requests; they continue in the background after an HTTP request ends.
   - **Azure App Service:** for a sidecar-enabled app, set the main
     container's target port to `8080`. For the classic custom-container
     configuration, set the app setting `WEBSITES_PORT=8080`.
5. Set any Azure HTTP readiness/health probe to `/healthz` on port `8080`.
6. In Stripe, use `https://YOUR_HOSTNAME/stripe/webhook` for the webhook,
   copy its signing secret into `ENDPOINT_SECRET`, and update your payment
   success/return URLs to the deployed hostname.

The existing Stripe pricing table and product IDs belong to the original
Stripe account. If using another account, update those values in the client
and server as well.

Azure references:
[Container Apps ingress](https://learn.microsoft.com/en-us/azure/container-apps/ingress-how-to),
[App Service custom container settings](https://learn.microsoft.com/en-us/azure/app-service/configure-custom-container),
[App Service sidecar target ports](https://learn.microsoft.com/en-us/azure/app-service/configure-sidecar).
