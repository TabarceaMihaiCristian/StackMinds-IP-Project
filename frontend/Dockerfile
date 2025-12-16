# ---- Build stage ----
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install deps
COPY frontend/package*.json ./
RUN npm ci

# Copy the rest of the frontend source
COPY frontend/ .

# Build the production bundle
RUN npm run build

# ---- Run stage (nginx) ----
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
