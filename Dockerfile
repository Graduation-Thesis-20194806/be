FROM public.ecr.aws/docker/library/node:18-bullseye-slim AS builder

# RUN apk update
# RUN apk --no-cache add make gcc g++ --virtual .builds-deps build-base python3 musl-dev openssl-dev

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build
RUN npm ci --omit=dev


FROM gcr.io/distroless/nodejs18-debian12

WORKDIR /app

COPY --from=builder /app ./
COPY .env.default .env

CMD ["dist/main.js"]
