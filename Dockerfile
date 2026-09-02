# ------------ Build Stage ------------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ------------ Production Stage ------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy node_modules and built assets directly from builder (prevents double npm ci)
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 8080

# Bind to 0.0.0.0 and listen on dynamic $PORT (or fallback to 8080)
CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p ${PORT:-8080}"]
