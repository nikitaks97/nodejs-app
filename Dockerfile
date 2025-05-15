# Use official Node.js 18 image
FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY index.js .
RUN npm install --production
EXPOSE 3000
CMD ["node", "index.js"]
