local:
	cd Backend && python3 manage.py makemigrations chat user_management && python3 manage.py migrate && python3 manage.py runserver &
	cd Frontend && npm install && npm run dev
JOBS=30
all :
	COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build --parallel
	docker-compose up --build -d
clean :
	docker-compose down

fclean :
	docker-compose down -v --rmi all
	docker volume rm -f $(docker volume ls -q)
