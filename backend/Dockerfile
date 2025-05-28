FROM node:18

WORKDIR /app

# Copiază doar fișierele package.json și package-lock.json
COPY package*.json ./
RUN npm install

# Copiază toate fișierele din directorul backend în container
COPY . .

# Rulează aplicația
CMD ["node", "server.js"]