all :
	docker-compose up --build -d
clean :
	docker-compose down

fclean :
	docker-compose down -v --rmi all
	docker volume rm -f $(docker volume ls -q)