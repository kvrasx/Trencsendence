#!/bin/bash
  /usr/local/bin/kibana-docker &
  KIBANA_PID=$! 
  echo "Attempting to upload dashboard...";
  while true; do
    UPLOAD_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://localhost:5601/api/saved_objects/_import" \
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