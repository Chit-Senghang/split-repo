FROM node:16-alpine
WORKDIR /app
COPY ../../ .

RUN yarn install
RUN apk update && apk add --no-cache --upgrade bash curl

# RUN yarn test:e2e
CMD ./start.sh