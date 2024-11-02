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

# Install dependencies
RUN npm install

# Build the app
RUN npm run build --workspace=@assetmanager/db
RUN npm run build --workspace=@assetmanager/backend

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json .

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm install --production # Install only production dependencies

# Copy the `db` package's build output separately
COPY --from=builder /app/packages/db/dist ./node_modules/@assetmanager/db/dist
COPY --from=builder /app/packages/db/package.json ./node_modules/@assetmanager/db/package.json

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.mjs"]
