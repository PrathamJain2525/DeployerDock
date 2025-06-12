FROM ubuntu:focal

# Install dependencies
RUN apt-get update && \
    apt-get install -y curl git && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /home/app

# Copy necessary files
COPY main.sh main.sh
COPY script.js script.js
COPY package*.json ./
COPY .env .env

# Install npm dependencies
RUN npm install

# Make shell script executable
RUN chmod +x main.sh

# Run the main shell script
ENTRYPOINT [ "bash", "main.sh" ]