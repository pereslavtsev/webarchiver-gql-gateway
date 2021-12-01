FROM node:14.18.1 AS builder

WORKDIR /usr/src/app

RUN npm i -g pnpm && pnpm install glob rimraf

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=$GITHUB_TOKEN

COPY .npmrc .
COPY package.json .
COPY pnpm-lock.yaml .

RUN pnpm install \
      --reporter=silent \
      --frozen-lockfile \
      --ignore-scripts \
      --no-optional

COPY . .

RUN pnpm build

FROM node:14.18.1-alpine3.14

RUN apk update \
    && apk --no-cache --update add bash build-base

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

ENV PATH=/root/.local:$PATH

# Migrations
COPY tsconfig.json .
COPY package.json .
COPY Makefile .
COPY src src

CMD ["node", "dist/main"]