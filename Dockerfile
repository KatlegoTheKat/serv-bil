FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package configurations
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]
