# ✅ Usamos Node.js 20 en su versión Alpine
# Alpine es una distribución Linux muy liviana (~5MB vs ~900MB de Ubuntu)
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# ✅ Copiamos primero solo los archivos de dependencias
# Esto aprovecha el cache de Docker — si no cambiaron las dependencias,
# no las reinstala en cada build
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# ✅ Ahora copiamos el resto del código
# Si solo cambia el código pero no las dependencias,
# Docker usa el cache del paso anterior
COPY . .

# Puerto que expone el contenedor
EXPOSE 3000

# Comando para arrancar el servidor
CMD ["node", "src/app.js"]
