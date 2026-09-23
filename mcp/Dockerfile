# Generated for Smithery.ai & Glama.ai MCP Registry
# Multi-stage lightweight build for isolated Firecracker microVM execution
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY smithery.yaml ./

# MCP communicates over stdio
ENV NODE_ENV=production
ENV GECICI_API_URL=https://gecici.email/api/v1

ENTRYPOINT ["node", "dist/index.js"]
