FROM python:3.11-slim

RUN mkdir app

COPY script.sh /

RUN chmod +x script.sh

EXPOSE 8000

CMD ["sh", "script.sh"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]