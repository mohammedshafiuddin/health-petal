# Stage 1: Build the React app
FROM node:20-alpine as react-build
WORKDIR /app/web-ui
COPY web-ui/package.json web-ui/package-lock.json ./
RUN npm install
COPY web-ui/ ./
RUN npm run build

# Stage 2: Build the Node.js backend
FROM node:20-alpine as backend-build
WORKDIR /app/web-backend
COPY web-backend/package.json web-backend/package-lock.json ./
RUN npm install
COPY web-backend/ ./
RUN npm run build

# Stage 3: Serve the application
FROM node:20-alpine
WORKDIR /app

# Copy built React app from Stage 1
COPY --from=react-build /app/web-ui/dist ./web-backend/public

# Copy built Node.js backend from Stage 2
COPY --from=backend-build /app/web-backend/dist ./web-backend/dist
COPY --from=backend-build /app/web-backend/node_modules ./web-backend/node_modules
COPY web-backend/package.json ./web-backend/

WORKDIR /app/web-backend

EXPOSE 3000
CMD ["node", "dist/index.js"]
