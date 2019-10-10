# Use the base image with Node.js
FROM node:latest
ARG NODE_ENV
ARG BABEL_ENV

ENV NODE_ENV=$NODE_ENV
ENV BABEL_ENV=$BABEL_ENV

# Copy the current directory into the Docker image
COPY . /challenge-engine-ui

# Set working directory for future use
WORKDIR /challenge-engine-ui

# Install the dependencies from package.json
RUN echo "NODE ENV in Docker: $NODE_ENV"
RUN echo "BABEL ENV in Docker: $BABEL_ENV"
RUN npm install
RUN npm run lint
#RUN npm run lint:fix
RUN npm run build
#RUN npm run test

CMD npm start