FROM node:14-buster
WORKDIR /app
COPY . .
CMD ["./scripts/wait-for-it.sh", "graph-node-test:8030",  "--", "yarn", "test-run"]
