FROM docker.io/nginxinc/nginx-unprivileged

ARG APP

USER root

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY ./dist/apps/${APP}/browser/ /usr/share/nginx/html/

RUN mkdir -p /usr/share/nginx/html/assets/env \
  && chown -R nginx:root /usr/share/nginx/html \
  && chmod -R g+rwX /usr/share/nginx/html

USER nginx

EXPOSE 8080:8080

CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/assets/env/env.template.js > /usr/share/nginx/html/assets/env/env.js && exec nginx -g 'daemon off;'"]
