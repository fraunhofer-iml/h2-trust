FROM node:22-alpine3.23

ARG APP
ENV NODE_ENV="production"

WORKDIR /home/node

COPY --chown=node:node ./dist/apps/${APP} .
COPY --chown=node:node ./libs/database/src/lib .

RUN npm install --omit=dev
RUN npx prisma generate

USER node

CMD ["node", "main.js"]
