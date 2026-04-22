# --- DOCKERFILE PARA EL FRONTEND (CLIENTE) ---

# --- ETAPA 1: CONSTRUCCIÓN (BUILD) ---
FROM node:20 AS build

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación para producción (genera la carpeta 'dist')
RUN npm run build

# --- ETAPA 2: SERVIDOR DE PRODUCCIÓN (NGINX) ---
FROM nginx:stable-alpine

# Copiamos los archivos estáticos generados por Vite en la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx corre en el puerto 80 por defecto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
