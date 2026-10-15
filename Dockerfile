FROM node:20-alpine

WORKDIR /app
# Bağımlılık yok; sadece sunucu ve statik dosyalar.
COPY package.json server.js ./
COPY public ./public

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
USER node

CMD ["node", "server.js"]
