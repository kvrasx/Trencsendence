cd app
pip install --no-cache-dir -r requirements.txt
<<<<<<< HEAD
python manage.py makemigrations chat 
python manage.py makemigrations user_management 
=======
# python manage.py makemigrations chat 
python manage.py makemigrations chat user_management ping_pong
>>>>>>> master
python manage.py migrate
# tail -f
python -u manage.py runserver 0.0.0.0:8000

