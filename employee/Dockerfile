FROM node:16-alpine as builder
WORKDIR /app/temp
COPY . .
RUN apk add git

RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

RUN yarn build authentication

RUN rm -rf node_modules && \
  NODE_ENV=production yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true 

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app/temp/fonts /usr/share/fonts
COPY --from=builder /app/temp/dist ./dist
COPY --from=builder /app/temp/apps/shared-resources/proto/*.proto ./dist/apps/shared-resources/proto/
COPY --from=builder /app/temp/node_modules ./node_modules
COPY --from=builder /app/temp/package.json .
# COPY --from=builder /app/temp/.env  .
COPY --from=builder /app/temp/apps/authentication/.env  .
RUN rm -rf /app/temp

ENV HOST 0.0.0.0

EXPOSE 8080
EXPOSE 40000

CMD [ "yarn","start:dev:authentication"]