# Multi-stage build for Claude Code UI Docker deployment
FROM docker.cnb.cool/masx200/docker_mirror/node:22-alpine-linux-amd64 AS base





run yarn config set registry https://registry.npmmirror.com


run npm install -g cnpm --registry=https://registry.npmmirror.com
run npm config set registry https://registry.npmmirror.com
run cnpm i -g --force npm cnpm yarn


run sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

# Install system dependencies required for the application
RUN apk add   sudo  --no-cache \
    python3 py3-pip\
    make \
    g++ \
    git \
    bash \
    curl \
    nano \
    tree

# Set working directory
WORKDIR /app

# Copy package files (both package.json and package-lock.json)
COPY package.json package-lock.json ./


run pip config set install.trusted-host 'https://pypi.tuna.tsinghua.edu.cn'
run pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple



# Install dependencies using yarn install --force for reproducible builds
RUN yarn install --force --omit=dev --detial && npm cache clean --force





run npm install -g cnpm --registry=https://registry.npmmirror.com
run npm config set registry https://registry.npmmirror.com
run cnpm i -g --force npm cnpm yarn



run sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

# Copy package files for build stage
COPY package.json package-lock.json ./

# Install all dependencies including dev dependencies for building
RUN yarn install --force

# Copy source code
COPY . .

RUN yarn install --force
# Build the frontend
RUN npm run build



run yarn config set registry https://registry.npmmirror.com

run npm install -g cnpm --registry=https://registry.npmmirror.com
run npm config set registry https://registry.npmmirror.com
run cnpm i -g --force npm cnpm yarn



run sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories

# Install system dependencies required for runtime and native modules
RUN apk add  nano sudo  --no-cache \
    python3 py3-pip\
    make \
    g++ \
    bash \
    curl \
    git


# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./


run pip config set install.trusted-host 'https://pypi.tuna.tsinghua.edu.cn'
run pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple



RUN yarn install --force
# Install production dependencies only
RUN yarn install --force --detail --omit=dev && npm cache clean --force

# Copy built frontend from build stage
# COPY --from=build /app/dist ./dist

# Copy server code and other necessary files
COPY server ./server
COPY public ./public
COPY package*.json ./
COPY .env.example ./


RUN yarn install --force
# Create directory for SQLite database
RUN mkdir -p /app/data
copy . .
# 构建后端
RUN npm run build

# Create default .env file for Docker deployment
RUN echo "PORT=4008\nNODE_ENV=production\nDB_PATH=/app/data/auth.db\nHOME=/opt/docker" > .env
env HOME=/opt/docker
# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set up directory permissions
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER root

# Expose port internally (not to host)
EXPOSE 4008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:4008/api/auth/status || exit 1

# Start the application (server only, build is already done)
CMD ["npm", "run", "server"]
run npm i -g pnpm




env PNPM_HOME="/root/.local/share/pnpm"

env PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.local/share/pnpm



run pnpm i -g easy-llm-cli 


RUN cnpm install -g easy-llm-cli 

