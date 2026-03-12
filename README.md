# ClearSplit Backend

A Node.js/TypeScript REST API for managing shared expenses with group splitting logic. This repo contains the server code, database schema/seed script, and integration tests.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-fork-or-url>.git
   cd clearsplit-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   - Copy `sample.env` to `.env` and populate with your own values.
   - A typical configuration uses a MySQL-compatible database (Aiven, local, etc.).
   - `JWT_SECRET` should be a long, random string in production.

4. **Database setup**
   ```bash
   npm run seed          # drops/creates schema and seeds sample data
   ```
   > 🔁 The seed script uses transactions and will reset existing tables.

5. **Run the server**
   ```bash
   npm run dev           # starts with ts-node + nodemon
   npm run build && npm start  # compile and run production code
   ```

6. **Tests**
   - Unit and integration tests use Jest + Supertest.
   - To run integration tests:
     ```bash
     npm run test:integration
     ```
   - Coverage reports are generated under `coverage/`.

## 🏗  Project Structure

```
src/
  controllers/   # request handlers
  models/        # database access helpers
  routes/        # express routes
  middleware/    # auth, error handling, logging
  validators/    # express-validator chains
  utils/         # helpers (responses, errors, logger)
  db.ts          # mysql2 pool
  index.ts       # express app
  seed.ts        # schema + data helper

tests/           # integration tests + jest setup

.bruno/          # Bruno API collection files

package.json
tsconfig.json
```

## 🔐 Security & Best Practices

- Never commit `.env` or any file containing real credentials – these are ignored by `.gitignore`.
- Use environment variables for all secrets (JWT, database credentials).
- The seed script is intentionally destructive; do not run against production databases.

## 🚢 Deployment

The backend can be deployed in several ways; we recommend [Railway](https://railway.app) but any Node.js host will work.

### 🚀 Railway options

1. **One‑click template** – start from a ready‑made repo and eject.
2. **GitHub repo** – connect your GitHub project, add a PostgreSQL service, set `DATABASE_URL=${{Postgres.DATABASE_URL}}`, then click Deploy.
3. **CLI** – install `railway` CLI, run `railway init`, add a Postgres service (`railway add -d postgres`), configure a service with `DATABASE_URL`, and finally `railway up`.
4. **Dockerfile** – include the `Dockerfile` provided in the project root; Railway automatically detects and builds it when deploying from CLI or GitHub.  You can also push the image to any registry and point Railway to it.

> During deployment you’ll need to set the same env vars used locally (see `sample.env`).

### ✅ Example `Dockerfile`

This Dockerfile uses a **multi-stage build** so the final image only contains the compiled JavaScript and production dependencies. It also exposes a health‑check that verifies the container can reach the database.

```dockerfile
# stage 1: compile project
FROM node:lts AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

# stage 2: runtime image
FROM node:lts
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('./dist/db').query('SELECT 1').then(()=>process.exit(0)).catch(()=>process.exit(1))"

CMD ["node", "dist/index.js"]
```

> 💡 Logs from the container are written to stdout/stderr; use `docker logs <id>` or the Railway console to inspect them. The healthcheck above pings the MySQL pool exported by `src/db.ts`—if your `DATABASE_URL` is incorrect or the database is unavailable, the container will fail the check.

### ⚠️ Notes

* The seed script is destructive; don’t run it in production.
* Use environment variables for credentials (`JWT_SECRET`, database URL, etc.).
* You may adapt the guide above for other providers (Heroku, Vercel, etc.).

## 🧩 Contributing

1. Fork the repo and create a new branch
2. Make your changes with accompanying tests
3. Ensure linting/typing passes (`npm run lint` if configured)
4. Open a pull request explaining the purpose and scope

Feel free to browse the existing issues or add new feature requests!

---

> Built with ❤️ by contributors. Let's keep ClearSplit awesome!
