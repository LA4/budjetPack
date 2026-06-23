#!/bin/sh

# 1. On écrit la variable d'environnement Azure dans le fichier JS lu par le index.html
echo "window.ENV_API_URL='${API_URL}';" > /usr/share/nginx/html/env-config.js

# 2. On lance le serveur Nginx au premier plan pour maintenir le conteneur en vie
exec "$@"