FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx tsc

# The MCP server uses stdio for communication
ENTRYPOINT ["node", "dist/index.js"]
