cd app
pip install --no-cache-dir -r requirements.txt
python manage.py makemigrations chat 
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

