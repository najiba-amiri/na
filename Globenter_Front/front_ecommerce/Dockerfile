# syntax=docker.io/docker/dockerfile:1

############################
# 1. Base image
############################
FROM node:20-bullseye AS base
WORKDIR /app

############################
# 2. Install dependencies
############################
FROM base AS deps

# Copy lockfiles & npm config if they exist
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./

# Install dependencies with correct tool
RUN if [ -f yarn.lock ]; then \
      yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm config delete optional --global || true && \
      npm config set ignore-scripts false && \
      npm ci --legacy-peer-deps --include=optional; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable pnpm && pnpm i --frozen-lockfile; \
    else \
      echo "Lockfile not found." && exit 1; \
    fi

############################
# 3. Build the Next.js app
############################
FROM base AS builder
WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Config files (optional)
COPY tsconfig.json ./

# Copy the rest of your app source
COPY . .

# Disable Turbopack (helps avoid lightningcss native binding issues in Docker)
ENV NEXT_DISABLE_TURBOPACK=1

# Extra safety: rebuild lightningcss native bindings (won't fail the build if it can't)
RUN npm rebuild lightningcss --verbose || true

# Build Next.js
RUN if [ -f yarn.lock ]; then \
      yarn run build; \
    elif [ -f package-lock.json ]; then \
      npm run build; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable pnpm && pnpm run build; \
    else \
      echo "Lockfile not found." && exit 1; \
    fi

############################
# 4. Production runtime
############################
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy assets and standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Start the standalone server
CMD ["node", "server.js"]
