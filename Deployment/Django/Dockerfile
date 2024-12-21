FROM python:3.11-slim

WORKDIR /app

COPY ../Transcendance/back/* /app/

RUN pip install --no-cache-dir -r requirements.txt && python manage.py makemigrations && python manage.py migrate

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]