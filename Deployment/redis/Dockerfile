FROM debian:11

RUN apt update && apt upgrade -y && apt install -y redis-server

EXPOSE 6379

COPY setup.sh /

CMD ["sh", "setup.sh"]