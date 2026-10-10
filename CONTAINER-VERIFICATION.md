# Container verification

Verified on 10 October 2026 with Trivy 0.75.0 and its downloaded advisory database.
Database updated: 10 October 2026 at 18:59 UTC.
Final image ID: `sha256:63fd4962047f42e4375e55f497dede3fdccf1be61244f51253a34dce2311cb36`.

The editor's confirmed high-severity finding is `CVE-2026-85091` in zlib.
The upstream `alpine:3.24` image contains `zlib` 1.3.2-r0. Trivy classifies
this advisory as medium, so its zero-high count for that upstream image
does not mean the advisory is absent or that the editor warning is cleared.
The Dockerfile explicitly requires `zlib>=1.3.2-r1`, the fixed Alpine package,
before any app builds or runs. An editor that scans the upstream `FROM`
image can keep showing the warning until Alpine publishes a rebuilt image.

| Artifact | Trivy critical | Trivy high |
| --- | ---: | ---: |
| Upstream `alpine:3.24` image used by `FROM` | 0 | 0 |
| Assembled Node-only shared base | 0 | 0 |
| Build-only npm 12.2.0 tooling stage | 0 | 4 |
| Final `botpulse:latest` runtime image | 0 | 0 |

The Dockerfile now starts from `alpine:3.24` and copies only the Node
executable from the official `node:24-alpine3.24` image. The shared base
contains Node 24.21.0 and no npm or Yarn. The assembled shared base and final
runtime contain `zlib` 1.3.2-r1, and `CVE-2026-85091` is absent from their
scan results at every severity level.

The original Node image has findings in npm's bundled dependencies. Its npm
files are copied only into a separate build stage and updated to 12.2.0.
That current npm release still bundles `brace-expansion` 5.0.9 (two high
advisories), `http-cache-semantics` 4.2.0, and `undici` 6.28.0 (one high
advisory each). Its tooling stage also reports 7 medium and 1 low findings.
These packages are excluded from the shared base and final runtime. Build
stages still need their own dependency audits; this report does not cover
every frontend build dependency.

The final scan also reports 2 medium, 2 low, and 5 unknown-severity
findings. Unknown advisories:

| Package | Advisory |
| --- | --- |
| `cups-libs` | `CVE-2025-55480` |
| `cups-libs` | `CVE-2026-55453` |
| `cups-libs` | `CVE-2026-55467` |
| `cups-libs` | `CVE-2026-61702` |
| `libvpx` | `CVE-2026-1861` |

Trivy warned about third-party SBOM metadata and could not retrieve details
for CVE-2025-55480 and CVE-2026-55467. Counts reflect this scanner and database;
they do not establish that the image has no vulnerabilities.

Changes include current backend dependency lockfiles, removal of unused
Node packages, bcrypt 6, Chromium/driver 155.0.8059.39, libexpat 2.9.0, and
removal of Python installers after Selenium dependency installation. Browser
packages and libexpat use tagged Alpine edge repositories; rebuild and verify
when those upstream packages change.

All disposable-container smoke checks passed after explicitly requiring
the fixed zlib package in the final npm 12 build:
frontend and React Router,
registration/login, compatibility with bcrypt 5 password hashes, authenticated
API requests, internal bot/Python launch, signed Stripe webhook forwarding,
headless Chromium, backend port isolation, missing configuration errors,
graceful shutdown, and exit when a service fails. These checks use an isolated
temporary MongoDB. The earlier investigation also verified the corrected
external MongoDB configuration with a read-only ping. No real bot session
or payment was started.

The local MongoDB failure was caused by the old example URI in the root
`.env`. Its example settings were replaced with the existing settings from
`server/.env`. Secrets remain outside the image; Azure needs the same values
in its runtime environment settings.

To reproduce the final scan with Trivy installed:

```bash
docker run --rm --entrypoint sh botpulse:latest -c 'apk list --installed zlib'
trivy image --scanners vuln botpulse:latest
```

Scan every severity when checking this CVE; a high/critical severity filter
can omit it under Trivy's classification.
