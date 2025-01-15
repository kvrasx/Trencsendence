FROM debian:11

RUN apt update && apt upgrade -y && apt install -y nginx openssl

RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/mykey.key -out /etc/ssl/certs/mycertif.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=jidev.xyz"

COPY nginx.conf /etc/nginx/nginx.conf


CMD ["nginx" , "-g", "daemon off;"]