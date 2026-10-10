#!/usr/bin/env bash
set -Eeuo pipefail

for name in MONGO_URL JWT_SECRET STRIPE_KEY ENDPOINT_SECRET; do
    if [[ -z "${!name:-}" ]]; then
        echo "Missing required environment variable: $name" >&2
        exit 1
    fi
done

pids=()
stop_services() {
    if (( ${#pids[@]} )); then
        kill -TERM "${pids[@]}" 2>/dev/null || true
        wait "${pids[@]}" 2>/dev/null || true
        pids=()
    fi
}
trap stop_services EXIT
trap 'exit 0' TERM INT

# Each backend gets its own PORT, regardless of Azure's PORT setting.
(
    cd /app/server
    HOST=127.0.0.1 PORT=3001 S_PORT=4242 exec node index.js
) &
pids+=("$!")

(
    cd /app/botBackend
    HOST=127.0.0.1 PORT=3002 exec node index.js
) &
pids+=("$!")

# Route early startup errors to stderr as well as configured runtime errors.
nginx -e stderr -g 'daemon off;' &
pids+=("$!")

# If any service exits, stop the container so the host can restart it.
status=0
wait -n "${pids[@]}" || status=$?
echo "A service exited unexpectedly (status $status); stopping the container." >&2
if (( status == 0 )); then
    status=1
fi
exit "$status"
