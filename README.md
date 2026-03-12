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

## 🧩 Contributing

1. Fork the repo and create a new branch
2. Make your changes with accompanying tests
3. Ensure linting/typing passes (`npm run lint` if configured)
4. Open a pull request explaining the purpose and scope

Feel free to browse the existing issues or add new feature requests!

---

> Built with ❤️ by contributors. Let's keep ClearSplit awesome!
