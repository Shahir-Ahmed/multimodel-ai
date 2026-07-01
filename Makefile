.PHONY: up down logs build test clean

up:        ## Start backend + frontend with hot reload (Ctrl+C to stop)
	docker compose up --build

down:      ## Stop the containers
	docker compose down

logs:      ## Tail logs from both services
	docker compose logs -f

build:     ## Rebuild images without starting them
	docker compose build

test:      ## Run the frontend test suite inside its container
	docker compose run --rm frontend npm test

clean:     ## Stop containers and remove the node_modules volume
	docker compose down -v
