# Use the base image with Node.js
FROM node:10
ARG NODE_ENV
ARG BABEL_ENV

ARG FILE_PICKER_API_KEY
ARG FORCE_DEV

ENV NODE_ENV=$NODE_ENV
ENV BABEL_ENV=$BABEL_ENV
ENV FILE_PICKER_API_KEY=$FILE_PICKER_API_KEY
ENV FORCE_DEV=$FORCE_DEV

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