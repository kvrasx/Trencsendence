#!bin/bash

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/mykey.key -out /etc/ssl/certs/mycertif.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=$VITE_HOST"

nginx -g "daemon off;"