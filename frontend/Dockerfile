# ================================
# ETAPA 1 — Build
# ================================
#  Esto se llama "multi-stage build"
# Usamos Node solo para compilar React
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

#  Compilamos React → archivos estáticos en /app/dist
RUN npm run build

# ================================
# ETAPA 2 — Producción
# ================================
#  La imagen final solo tiene Nginx + los archivos compilados
# Sin Node.js, sin código fuente, sin dependencias de desarrollo
# Resultado: imagen mucho más pequeña y segura
FROM nginx:alpine

# Copiamos los archivos compilados al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

#  Configuración de Nginx para React Router
# Sin esto, al recargar /dashboard daría 404
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]