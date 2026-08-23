FROM nginx:1.27-alpine

# Railway injects $PORT at runtime. The nginx image runs envsubst over
# /etc/nginx/templates/*.template on boot, so ${PORT} is filled in there.
ENV PORT=8080

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY index.html /usr/share/nginx/html/index.html

# Optional assets — copied only if present (see .dockerignore notes in README)
COPY robots.txt sitemap.xml /usr/share/nginx/html/

EXPOSE 8080
