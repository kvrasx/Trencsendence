JOBS=30

all :
	COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build --parallel
	docker-compose up --build -d

local:
	cd Backend && python3 manage.py makemigrations chat user_management && python3 manage.py migrate && python3 manage.py runserver &
	cd Frontend && npm install && npm run dev


attached:
	COMPOSE_DOCKER_CLI_BUILD=0 docker-compose build --parallel
	docker-compose up --build

clean :
	rm -rf Backend/**/__pycache__/
	rm -rf Backend/**/migrations/
	docker-compose down 
	docker volume ls -q | xargs -r docker volume rm -f
fclean :
	docker-compose down -v --rmi all
	docker volume rm -f $(docker volume ls -q)
