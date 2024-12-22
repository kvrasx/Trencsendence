all :
	docker-compose up --build -d
clean :
	docker-compose down

fclean :
	docker-compose down --rmi all
