# Stage 1: Builder
FROM node:lts-alpine as builder

WORKDIR /app

# Copy root files
# COPY package*.json ./
# COPY tsconfig*.json ./

# Copy shared-types and backend package files
# COPY shared-types/package*.json ./shared-types/
COPY backend/package*.json ./backend/

# Install root dependencies
# RUN npm install

# Install shared-types dependencies
# RUN cd shared-types && npm install

# Install backend dependencies
RUN cd backend && npm install

# Copy all source files
COPY shared-types ./shared-types
COPY backend ./backend

# Build shared-types first
# RUN cd shared-types && npm run build

# Build backend (which depends on shared-types)
RUN cd backend && npm run build

# Stage 2: Production
FROM node:lts-alpine

WORKDIR /app

# Copy production dependencies
COPY --from=builder /app/backend/package*.json ./backend/
# COPY --from=builder /app/shared-types/package*.json ./shared-types/

# Install production dependencies
# RUN cd shared-types && npm install --only=production
RUN cd backend && npm install --only=production

# Copy built files
# COPY --from=builder /app/backend/shared-types/ ./shared-types/
COPY --from=builder /app/backend/dist ./backend/dist

# Set working directory to backend
WORKDIR /app/backend

# Expose the port
EXPOSE 4000

# Command to run the application
CMD ["node", "dist/backend/index.js"]