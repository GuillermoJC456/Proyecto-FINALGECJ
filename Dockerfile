FROM node:24-alpine
WORKDIR /app
RUN npm install -g pnpm@11.19.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY src ./src
COPY scripts ./scripts
RUN mkdir data && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
