# Builder stage
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Copy root workspace files
COPY package.json .
COPY package-lock.json .
COPY turbo.json .

# Copy the necessary workspace files
COPY packages/db ./packages/db
COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend

# Install dependencies
RUN npm install

# Build both backend and frontend apps
RUN npm run build --workspace=@assetmanager/db
RUN npm run build --workspace=@assetmanager/backend
RUN npm run build --workspace=apps/frontend

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static

# Include the backend and db builds
COPY --from=builder /app/apps/backend/dist ./node_modules/@assetmanager/backend/dist
COPY --from=builder /app/packages/db/dist ./node_modules/@assetmanager/db/dist

# Ensure package files are copied for backend and db
COPY --from=builder /app/apps/backend/package.json ./node_modules/@assetmanager/backend/package.json
COPY --from=builder /app/packages/db/package.json ./node_modules/@assetmanager/db/package.json

# Install production dependencies
COPY package.json package-lock.json ./
RUN npm install --production

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "apps/frontend/.next/standalone/server.js"]
