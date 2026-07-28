# STAGE 1: Build the React Application
FROM node:20-alpine AS build

# Set working directory inside container
WORKDIR /app

# Copy dependency definition files
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Set up build argument for API URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy frontend source files
COPY . .

# Build Vite project for production
RUN npm run build

# STAGE 2: Serve built assets using Nginx
FROM nginx:stable-alpine

# Copy built static files from Stage 1 to Nginx serve folder
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx HTTP Port
EXPOSE 80

# Run Nginx server in the foreground
CMD ["nginx", "-g", "daemon off;"]
