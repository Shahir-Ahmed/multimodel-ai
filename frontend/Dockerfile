FROM node:20-slim

WORKDIR /app

# Install dependencies first so Docker caches this layer when only
# application code changes — rebuilds stay fast.
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
