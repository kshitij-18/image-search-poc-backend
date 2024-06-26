FROM node:18-alpine as build

WORKDIR /

COPY . .

RUN npm i

