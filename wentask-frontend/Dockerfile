# Étape 1 : Build
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur Nginx
FROM nginx:alpine

# CRUCIAL : On vide le dossier par défaut d'Nginx pour éviter les conflits
RUN rm -rf /usr/share/nginx/html/*

# On copie le contenu de TON build (ajuste selon ton test local à l'étape 1)
# Si tu as vu un dossier 'browser' sur ton PC, garde cette ligne :
COPY --from=build /app/dist/wentask-frontend/browser /usr/share/nginx/html

# On remplace la config par la tienne
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]