FROM python:3.11-slim

RUN mkdir app

EXPOSE 8000

COPY script.sh /

CMD ["sh", "script.sh"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]