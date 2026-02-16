# Use Node.js 22 base image
FROM node:22.22.0
RUN useradd -m -s /bin/bash appuser
ARG NODE_ENV
ARG BABEL_ENV

ARG FILE_PICKER_API_KEY
ARG FORCE_DEV

ENV NODE_ENV=$NODE_ENV
ENV BABEL_ENV=$BABEL_ENV
ENV FILE_PICKER_API_KEY=$FILE_PICKER_API_KEY
ENV FORCE_DEV=$FORCE_DEV
ENV NODE_OPTIONS="--max-old-space-size=6144"

# Copy the current directory into the Docker image
COPY . /challenge-engine-ui

# Set working directory for future use
WORKDIR /challenge-engine-ui

RUN chown -R appuser:appuser /challenge-engine-ui

# Enable corepack and prepare pnpm for installs (run as root)
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

USER appuser

# Install the dependencies from package.json using pnpm
RUN echo "NODE ENV in Docker: $NODE_ENV"
RUN echo "BABEL ENV in Docker: $BABEL_ENV"
RUN pnpm install
RUN pnpm run lint
#RUN npm run lint:fix
RUN pnpm run build
#RUN pnpm run test

CMD pnpm start
