FROM node:24.13-alpine3.23

ARG APP
ENV NODE_ENV="production"

WORKDIR /home/node

COPY --chown=node:node ./dist/apps/${APP} .
COPY --chown=node:node ./libs/database/src/lib .
COPY --chown=node:node ./docker/ProofStorage.json .

RUN npm install --omit=dev
RUN npx prisma generate

USER node

CMD ["node", "main.js"]
