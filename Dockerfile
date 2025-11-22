# ------------ Build stage ------------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ------------ Production stage ------------
FROM node:18-alpine AS runner

WORKDIR /app

# Only copy package.json & package-lock.json for prod install
COPY package*.json ./
RUN npm ci --only=production

# Copy built output and necessary files
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port 8080 instead of default 3000
EXPOSE 8080

# Start Next.js app with port 8080
CMD ["npm", "start", "--", "-p", "8080"]
