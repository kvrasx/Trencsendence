#!/bin/bash
mkdir -p $CERT_DIR
touch $SERVER_SSL_KEY
touch $SERVER_SSL_CERTIFICATE
chmod -R 777 $CERT_DIR/*
apt update && apt upgrade -y && apt install -y nginx openssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout $SERVER_SSL_KEY -out $SERVER_SSL_CERTIFICATE -subj "/C=US/ST=State/L=City/O=Organization/CN=$VITE_HOST"
  /usr/local/bin/kibana-docker &
  KIBANA_PID=$! 
  echo "Attempting to upload dashboard...";
  while true; do
    UPLOAD_RESULT=$(curl -s -k -o /dev/null -w "%{http_code}" -X POST "https://localhost:5601/api/saved_objects/_import" \
      -H "kbn-xsrf: true" \
      -H "Content-Type: multipart/form-data" \
      --form file=@/dashboard.ndjson)
    if [ "$UPLOAD_RESULT" -eq 200 ]; then
      echo "Dashboard uploaded successfully.";
      break;
    else
      echo "Retrying dashboard upload...";
      sleep 5;
    fi
  done;
  echo "Waiting for Kibana to exit...";
  wait $KIBANA_PID || echo "Kibana process has already exited.";