FROM nginx:1.27-alpine

# Railway injects $PORT at runtime. The nginx image runs envsubst over
# /etc/nginx/templates/*.template on boot, so ${PORT} is filled in there.
ENV PORT=8080

# Substitute ONLY $PORT. Without this filter envsubst considers every env var
# in the container, and any stray one named e.g. `uri` would clobber nginx's
# own $uri / $cache_control variables in the template.
ENV NGINX_ENVSUBST_FILTER="^PORT$"

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy the repo (minus .dockerignore exclusions) so new static assets —
# og-image.jpg, product photos, favicons — are served by just adding the file.
COPY . /usr/share/nginx/html/

# The template has to remain in the build context for the COPY above, so it
# also lands in the web root. Remove it — it is config, not a public asset.
RUN rm -f /usr/share/nginx/html/nginx.conf.template

EXPOSE 8080
