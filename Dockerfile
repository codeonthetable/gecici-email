# Root Dockerfile for Glama.ai & Smithery Container Builders
FROM node:20-alpine AS builder

WORKDIR /app

COPY mcp/package*.json mcp/tsconfig.json ./
RUN npm ci

COPY mcp/src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY mcp/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY mcp/smithery.yaml ./

ENV NODE_ENV=production
ENV GECICI_API_URL=https://gecici.email/api/v1

ENTRYPOINT ["node", "dist/index.js"]
