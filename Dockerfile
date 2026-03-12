# multi-stage build to keep final image small
# first stage: build TypeScript and install dev deps
FROM node:lts AS builder
WORKDIR /app

# copy package manifest first to take advantage of caching
COPY package.json package-lock.json ./
RUN npm ci

# copy source, build
COPY . ./
RUN npm run build

# second stage: runtime image
FROM node:lts
WORKDIR /app

# copy compiled output and production deps from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# set environment defaults
ENV NODE_ENV=production
EXPOSE 5000

# log to stdout/stderr by default, no special config needed
# healthcheck ensures DB connection works (requires dist/db.ts export)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('./dist/db').query('SELECT 1').then(()=>process.exit(0)).catch(()=>process.exit(1))"

# start the server
CMD ["node", "dist/index.js"]
