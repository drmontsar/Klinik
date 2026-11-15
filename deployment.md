# Deployment

## QA deployment

The workflow in `.github/workflows/deploy-qa.yml` runs type-checking, unit tests and a Worker build before deploying to `synapse-qa` on every push to `qa`. It then checks `/health` and `/ready` at https://synapse-qa.sensatarun007.workers.dev. Failed checks stop deployment; a failed post-deploy check reports failure but does not roll back the release.

Before the first push:

- Add GitHub repository Actions secrets `CLOUDFLARE_API_TOKEN` (Workers edit permissions scoped to your account) and `CLOUDFLARE_ACCOUNT_ID` (from your Cloudflare account/Worker overview).
- In the existing Cloudflare Worker, keep `DATABASE_URL` as a secret containing the Neon pooled URL. Set `CORS_ORIGINS` in the dashboard to your frontend origin(s). `wrangler.jsonc` manages `NODE_ENV=production`, `LOG_LEVEL=info`, and `ACCESS_CONTROL=true`; change these in the file rather than the dashboard. `keep_vars` preserves other dashboard variables; Worker secrets remain in Cloudflare. Preview URLs are explicitly disabled; the normal `workers.dev` URL remains available.
- Commit the Worker code and workflow, then push them to the `qa` branch. No GitHub-to-Cloudflare Builds connection is needed; GitHub Actions handles deployment.

The workflow never migrates, resets or seeds Neon. It needs no Neon credentials in GitHub. Database-backed integration tests are not part of this pipeline. For a local bundle without deployment, run `bun run worker:build`; generated output is in `dist/worker/worker.js` and includes dependencies.

Keep Cloudflare on the Free plan and GitHub Actions spending disabled; both have usage limits. Local workerd tests do not enforce the live Workers Free CPU limit, so login's scrypt cost must be checked after deployment. This is fictional QA data with shared passwords, not a secure public production environment. Workers use polling for events; file uploads require separately configured S3-compatible storage.

## Moving to the new Worker names

A Wrangler name change creates a separate Worker; it does not rename the existing
Worker or copy its secrets. Keep the old backend online until cutover is verified.

1. In the same Cloudflare account, create a placeholder Worker named `synapse-qa`.
2. Add `DATABASE_URL` as a secret using the same Neon pooled URL. Re-add any
   storage credentials or other application secrets and dashboard-managed variables.
   Cloudflare does not reveal old secret values; use your original credentials.
3. Set `CORS_ORIGINS=https://kortex-qa.sensatarun007.workers.dev` on the new Worker.
   The repository supplies `NODE_ENV`, `LOG_LEVEL`, `ACCESS_CONTROL`, compatibility
   flags and runtime code when deployed.
4. Push the backend changes to `qa` and verify the new `/health` and `/ready`.
5. Update the frontend repository's `KLINIK_BACKEND_URL` Actions variable to the
   new backend URL and deploy its `kortex-qa` Worker. Verify browser login and
   clinical workflows before deleting the old Workers.

Both backend Workers use the same existing Neon database. Do not reset, reseed
or migrate the database just to change the Worker name.

## Patient-chat report storage

On deployment, set `S3_BUCKET`, `S3_REGION`, and optionally `S3_ENDPOINT` (for an S3-compatible provider); use `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` or the host's standard AWS credential provider. Keep the bucket private; only the backend may read/write objects. Use HTTPS, restricted bucket credentials, backups, retention and malware scanning before handling real patient files. These local example credentials are **not** production secrets. Existing data lives outside this code worktree in the Docker volume; do not remove the volume unless you intend to delete the files.
