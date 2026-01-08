.PHONY: help install dev build build_static start lint clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

build_static: ## Build static site
	npm run build:static

start: ## Start production server
	npm run start

lint: ## Run linter
	npm run lint

clean: ## Clean build artifacts
	rm -rf .next/
