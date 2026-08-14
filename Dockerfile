# Etapa 1: Construcción de la aplicación Angular
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servidor Web Nginx para producción
FROM nginx:alpine

# Copiar build de Angular al directorio estático de Nginx
COPY --from=build /app/dist/panda-ahorrador/browser /usr/share/nginx/html

# Copiar configuración de Nginx para SPA (HTML5 routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
