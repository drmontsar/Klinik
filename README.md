# KliniK backend

GitHub Actions runs CI; deployment is not configured yet.

API and database for the KliniK doctor frontend in `../KL-2-doc`.

The standalone service uses `src/main.ts` for Bun startup and `src/app.ts` for application construction. See [the architecture guide](docs/architecture.md) for module boundaries and reference patterns.

```bash
bun install
cp .env.example .env
docker compose up -d
bun run seed  # applies migrations and inserts the portable fixture data
bun run dev
```

The API runs at `http://localhost:3001`; OpenAPI docs are at `/docs`.
PostgreSQL uses host port `5433` by default. If that port is occupied, set `POSTGRES_PORT` and the matching port in `DATABASE_URL` in `.env` before starting Docker (for example, use `5434` for both).
Set `LOG_LEVEL=info` (default) or `LOG_LEVEL=debug` in `.env`. Debug includes routine request logs; warnings and errors are logged at both levels. Application logs are emitted as JSON in every environment; authentication and patient-sensitive fields are redacted. One-off database scripts may also print plain-text status messages.
Set `CORS_ORIGINS` to a comma-separated list of allowed frontend origins. Development defaults to `http://localhost:3000,http://localhost:5173`; production allows none until configured.

### Patient-chat report storage (local)

`docker compose up -d` also starts **SeaweedFS** in single-node `weed mini` mode, persisting files in `seaweed_data`. The S3 API is at `127.0.0.1:8333` (opening it in a browser gives AccessDenied). To browse files, open the **local-only filer UI** at [http://localhost:8888/buckets/klinik-chat/](http://localhost:8888/buckets/klinik-chat/); uploaded reports are under `chat/`. This filer UI has **no patient authorization**: use it only with synthetic local data, never expose port 8888 on the LAN or in production. Browser/phone clients must use the authenticated API, not these storage ports. If PostgreSQL is already running in another worktree's Compose project, start just the storage service with `docker compose up -d seaweedfs` to avoid a port 5433 collision. Copy the S3 settings in `.env.example` into the worktree's local `.env` when running the API on the host. If the API also runs in this Compose network, use `S3_ENDPOINT=http://seaweedfs:8333` instead of `127.0.0.1`. Run `bun run migrate` to add patient-chat tables. See [API details](docs/api.md#patient-chat-and-private-report-attachments); `bun test/chat-integration.ts` checks seeded users, patient permissions, mentions, edits, and a real PDF round-trip against local SeaweedFS.

On deployment, set `S3_BUCKET`, `S3_REGION`, and optionally `S3_ENDPOINT` (for an S3-compatible provider); use `S3_ACCESS_KEY_ID`/`S3_SECRET_ACCESS_KEY` or the host's standard AWS credential provider. Keep the bucket private; only the backend may read/write objects. Use HTTPS, restricted bucket credentials, backups, retention and malware scanning before handling real patient files. These local example credentials are **not** production secrets. Existing data lives outside this code worktree in the Docker volume; do not remove the volume unless you intend to delete the files.
## Clean test database

If the database contains mixed old and new demo data, stop the API and run:

```bash
bun run reset:demo
bun run dev
```

**Warning:** `reset:demo` deletes all local database application data, including users, sessions, patients, clinical records, catalogues, and audit records. It **does not delete SeaweedFS objects**; locally uploaded reports can remain on disk without database records. For a complete disposable local reset, remove the `seaweed_data` Docker volume separately (never do that with real reports). It keeps the schema and migration history, then loads only the current canonical fixtures. Existing logins expire; sign in again after restarting the API.

The command is restricted to a local `klinik` database, the `klinik` database user, and development/test mode. Migrations run first. The data reset and reload share one transaction; a failed fixture insert restores the previous application data. Operational timestamps are moved to the reset time, preserving their relative intervals. Birth dates and insurance dates do not move.

**Test login: Bruce Wayne — `bruce+wayne@klinik.com` / `password`**. He is an enabled duty doctor. These shared demo credentials are for local/test fixtures only.

## Local QA data

This worktree's QA database is `klinik-qa-db-1` on **localhost:5434/klinik**. The original database on port 5433 and Neon are separate and are not modified by the QA scripts.

```bash
bun run seed:qa      # enrich the existing local fixture base; no reset required
bun run qa:verify    # field/timeline/score checks plus live HTTP API smoke tests
bun run qa:coverage  # regenerate DB-column coverage and frontend field-reference index
bun run dev
```

`seed:qa` refuses remote hosts, other ports/databases, and production mode. It runs in one transaction, replaces the local observation/alert series, refreshes relative timestamps, and uses stable IDs to avoid duplicate QA records on reruns. It is not for preserving manually entered QA observations. For a fresh QA database, configure port 5434, run `bun run reset:demo`, then `bun run seed:qa`; the reset is destructive and expires existing sessions. Do not run the additive base fixture loader after QA enrichment because QA intentionally changes its canonical names and identity records.

QA login: **`sameer+rao@klinik.com` / `password`**. Other existing accounts, such as `arjun+mehta@klinik.com`, keep their shared local password. These credentials must not be exposed publicly.

The dataset includes six fictional inpatient scenarios, patient identity/contact/kin/coverage, six observations per admission with app-calculated NEWS2, initial/nursing assessments, notes, investigations, medication charts, fluid balance, weights, care plans, tasks, rounds, handovers, outpatient visits and billing. Nullable lifecycle fields remain empty when the corresponding action has not occurred; no signatures or report-file keys are fabricated.

See [database field coverage and limitations](docs/qa-field-coverage.md) and [frontend field-reference inventory](docs/qa-ui-field-index.md). Investigation result panels cannot be populated solely by DB seeding: their current frontend adapter does not persist report updates. Catalogue synthetic metadata and existing frontend warnings are retained rather than misrepresenting fictional data as clinically validated.

## Portable test data

The canonical dataset is in `test-data/`: `manifest.json` defines the file order and fixed snapshot time, while the other JSON files contain organization, staff, catalogue, patient, clinical, and workflow records. `bun run seed` applies migrations and inserts missing fixture records without deleting existing data. It works on a newly created local `klinik` database without running the old seed.

The loader only inserts missing fixture records and never overwrites existing records. It records ownership in `test_data.seed_records`, rejects collisions with untracked records, and is safe to rerun. If you edit a data file, the new values are used on a fresh database; existing fixture records are deliberately not updated. Fresh additive loads use the fixed `snapshot_at` baseline for reproducibility. Reset selects the current clock; later additive loads preserve that selected clock.

Demo accounts include Bruce Wayne (`bruce+wayne@klinik.com`), duty doctor (`arjun+mehta@klinik.com`), consultant (`priya+shah@klinik.com`), nurse (`anita+rao@klinik.com`), and administrator (`kiran+patel@klinik.com`). The address is their first and second name (ignoring `Dr.`), joined with a literal `+` and followed by `@klinik.com`. All use the local/test password above. Production has no default password; provision the first administrator with `ADMIN_EMAIL` and `ADMIN_PASSWORD` using `bun run auth:bootstrap-admin` after migrations, then let that administrator create staff or assign credentials. The migration expires old OTP-issued sessions.

Existing historical records from previous seeds are preserved. The old generators now live under `test/fixtures/legacy/` and run only as integration fixtures, not as setup commands. The fixture data is fictional and is not a validated clinical or legal reference.

Run checks in order:

```bash
bun run verify  # TypeScript, unit tests, and database integration tests. Requires Docker.
```
