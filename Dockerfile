FROM node:16.15.1-alpine as base
WORKDIR /app
COPY ./ /app

FROM base as frontend
RUN yarn install
CMD ["yarn", "dev"]

FROM base as studio
RUN yarn install
CMD ["npx", "prisma", "studio"]