# 1. Build aşaması
FROM node:18 AS build
WORKDIR /app

# Önce package.json ve package-lock.json'u kopyala
COPY CryptoDashboard/package*.json ./CryptoDashboard/

# Dependencileri yükle
WORKDIR /app/CryptoDashboard
RUN npm install

# Kodların tamamını kopyala
COPY CryptoDashboard ./ 

# Build al
RUN npm run build

# 2. Prod aşaması - Nginx
FROM nginx:alpine
COPY --from=build /app/CryptoDashboard/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
