# Use official Node.js 20 image
FROM node:20-alpine
WORKDIR /app
COPY package.json .
COPY public ./public
COPY index.js .
RUN npm install --production
EXPOSE 3000
CMD ["node", "index.js"]
