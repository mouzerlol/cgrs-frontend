.PHONY: help install dev build start lint test test_unit test_e2e test_all clean

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm run start

lint: ## Run linter
	npm run lint

test: ## Run all tests (unit + e2e)
	npm run test && npm run test:e2e

test_unit: ## Run Vitest unit tests
	npx vitest run

test_e2e: ## Run Playwright e2e tests
	npx playwright test --reporter=list

test_all: ## Run all tests with coverage
	npx vitest run --coverage && npx playwright test --reporter=list

clean: ## Clean build artifacts
	rm -rf .next/
