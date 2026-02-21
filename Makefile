.PHONY: help install dev build start lint test test_unit test_e2e test_all clean worktree worktree-prune board

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

board: ## Start the Beads issue board UI (bdui)
	bdui start --open

board-stop: ## Stop the Beads issue board UI
	bdui stop

worktree: ## Create a beads-compatible worktree (use: make worktree NAME=feature-x [BRANCH=branch-name])
	@mkdir -p .worktrees
	bd worktree create .worktrees/$(NAME) --branch=$(or $(BRANCH),$(NAME))
	@cd .worktrees/$(NAME) && npm install

worktree-prune: ## Remove all non-main worktrees and prune stale entries
	@echo "Removing non-main worktrees..."
	@git worktree list --porcelain \
		| awk '/^worktree /{print $$2}' \
		| tail -n +2 \
		| xargs -I{} git worktree remove --force {} 2>/dev/null || true
	@echo "Pruning stale entries..."
	@git worktree prune --verbose
	@echo "Done. Remaining worktrees:"
	@git worktree list
