# MULTICON-W 2026 deployment guide

## Production values

The confirmed public domain is `multicon-w.com`. Set `DOMAIN=multicon-w.com` and `APP_URL=https://multicon-w.com` in the Dokploy environment. Keep `APP_URL` on HTTPS so the production session cookie is marked `Secure` and generated sitemap, robots, and canonical metadata use the public URL.

Copy `.env.example` as a checklist for required variables. Supply every `REPLACE_*` value through Dokploy's secret/environment settings or a protected server-side `.env`; do not put real values in this repository. Use an alphanumeric MongoDB root username and a long hexadecimal root password because Compose inserts them into a MongoDB URI. Use unique, long values for the S3 secret, JWT secret (at least 32 characters), and administrator password. Deliver administrator credentials over a secure channel.

## Services and routing

The repository's Compose file is configured for the Dokploy production ingress:

- Traefik routes `Host(`${DOMAIN:?DOMAIN must be set}`)` to `web` on internal port 80 through the external `dokploy-network`.
- Nginx connects to the application on the `edge` network. It does not publish a host port.
- `app`, `mongo`, and `minio` are not host-published. MongoDB and SeaweedFS use the isolated `internal` network.
- MongoDB 7 is the production database in this stack. The app connects to `mongo:27017/multiconw` and authenticates against `admin`; Compose builds the URI using the same `MONGO_ROOT_USER` and `MONGO_ROOT_PASSWORD` used to initialize the database.
- SeaweedFS provides the S3-compatible service at `http://minio:8333`. Keep the `minio` service name and the persistent `minio_data` volume.
- The app waits for healthy MongoDB and storage services. The `web` service waits for a healthy app.

Do not configure Atlas IP allowlisting for this architecture. Atlas may be considered separately only after intentionally redesigning the Compose database and startup health gate.

## Deployment

1. In Dokploy, configure the required environment variables from `.env.example`. Set `DOMAIN=multicon-w.com` and `APP_URL=https://multicon-w.com`. Replace all placeholders and provide the administrator seed credentials through a secure channel.
2. Confirm the external Docker network `dokploy-network` exists and that the platform's Traefik proxy is attached to it.
3. Deploy the repository with Docker Compose. Do not add host-published ports to `web`, `app`, `mongo`, or `minio`.
4. Configure the Cloudflare Tunnel for `multicon-w.com` to the platform's Traefik ingress according to the hosting platform's instructions.

## Post-deployment checks

- Confirm all four services are running and their health checks are passing.
- Open `https://multicon-w.com/api/health`; the expected response reports MongoDB and storage as `up`.
- Inspect `/sitemap.xml` and `/robots.txt`; generated public URLs should use `https://multicon-w.com`.
- Sign in and confirm the `crr_token` cookie is `HttpOnly`, `Secure`, and `SameSite=Lax`.
- Perform a controlled paper upload, administrative approval, and public retrieval before announcing service availability.

## Backups and recovery

Back up both the `mongo_data` and `minio_data` Docker volumes using an access-controlled, off-host backup process. Test restoration periodically. The local database and storage volumes are not backed up by Atlas.

## Security incident follow-up

A prior public revision of this repository contained a MongoDB Atlas credential. Treat that credential as compromised even though the current guide no longer contains it. Rotate or revoke it in Atlas and check Atlas Network Access for narrowly scoped rules if the account or cluster remains in use. The current Compose architecture does not require Atlas. Review public Git history and coordinate any history cleanup with repository owners; this guide does not rewrite history or claim the credential has been rotated.
