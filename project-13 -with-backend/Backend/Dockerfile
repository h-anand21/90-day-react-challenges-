# Use Node.js LTS version on Alpine Linux
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Expose port (Cloud Run automatically injects PORT environment variable, defaults to 8080 or the value you specify)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]