FROM nginx:1.27-alpine

# Railway injects $PORT at runtime. The nginx image runs envsubst over
# /etc/nginx/templates/*.template on boot, so ${PORT} is filled in there.
ENV PORT=8080

# Substitute ONLY $PORT. Without this filter envsubst considers every env var
# in the container, and any stray one named e.g. `uri` would clobber nginx's
# own $uri / $cache_control variables in the template.
ENV NGINX_ENVSUBST_FILTER="^PORT$"

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY index.html robots.txt sitemap.xml /usr/share/nginx/html/

EXPOSE 8080
