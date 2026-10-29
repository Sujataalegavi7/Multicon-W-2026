# MULTICON-W Conference Research Repository

A Next.js platform for conference paper submission, administrative review, and open-access publication.

## Deployment architecture

Docker Compose runs four services: `web` (Nginx), `app` (Next.js), `mongo` (MongoDB 7), and `minio` (SeaweedFS S3-compatible storage). Traefik routes the confirmed production host to Nginx over the external `dokploy-network`; Nginx listens on container port 80 and does not publish a host port. MongoDB and storage have no published ports and persist data in Docker volumes.

Nginx trusts only the platform's private proxy ranges (`10.0.0.0/8` and `172.16.0.0/12`) and reads the client address from `CF-Connecting-IP`. Health checks gate application startup on MongoDB and SeaweedFS readiness.

## Environment configuration

Do not keep production secrets in the repository. In Dokploy, set the required environment variables through its environment/secret settings. Production uses `DOMAIN=multicon-w.com` and `APP_URL=https://multicon-w.com`. Compose reads these from the deployment environment; no `.env.example` file is needed in production.

Compose builds the application's MongoDB URI from `MONGO_ROOT_USER` and `MONGO_ROOT_PASSWORD`, and connects to the private `mongo` service using the `admin` authentication database and `multiconw` database. Set the root credentials once in Dokploy; Compose uses them both to initialize MongoDB and to construct the app's connection URI.

Set `DOMAIN`, `APP_URL`, `MONGO_ROOT_USER`, `MONGO_ROOT_PASSWORD`, `JWT_SECRET`, `ADMIN_LOGIN_ID`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`. Compose defaults `S3_ENDPOINT` to `http://minio:8333`, `S3_BUCKET` to `my-pdfs`, and `S3_REGION` to `us-east-1`. Use an alphanumeric MongoDB root username and a long hexadecimal root password because Compose inserts them into a MongoDB URI. The administrator account is seeded on first startup from `ADMIN_LOGIN_ID`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`; provision and deliver those credentials through a secure channel. No default administrator password is published here.

## Running the Compose stack

1. For local Compose use, create a private root `.env` file with the required values listed above. Keep it out of Git. For a local Next.js development server, set `APP_URL=http://localhost` and `NODE_ENV=development`.
2. Compose requires an existing external network named `dokploy-network` and routes traffic through Traefik; Dokploy provides these in production. The Compose stack intentionally has no host-published ports, so it is not a standalone localhost web setup.
3. Deploy with `docker compose up -d --build` and inspect `docker compose ps` for health status. In production, open `https://multicon-w.com`; the health endpoint is `/api/health`.

The project uses npm (`package-lock.json`); available scripts are `npm run dev`, `npm run build`, and `npm run typecheck`.

## Database migrations

If legacy records in the persistent MongoDB volume contain the obsolete `printISBN` field, run the included non-destructive migration script inside the container or against the deployment database:

```bash
node scripts/remove-print-isbn-migration.mjs
```

This migration executes an `$unset` operation on `printISBN` without modifying other fields, deleting documents, or interrupting service.

## Production deployment

See [NEXT_STEPS.md](NEXT_STEPS.md) for the deployment and operational checklist. MongoDB runs in the Compose stack; Atlas is not required. Back up the `mongo_data` and `minio_data` volumes using the platform's protected backup process.
