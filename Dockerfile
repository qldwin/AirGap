FROM node:22

WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le projet
COPY . ./

# Build Nuxt
RUN npm run build
EXPOSE 3000
ENTRYPOINT [ "bash", "./entrypoint.sh" ]
