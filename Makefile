# Build and run the plugin with a pinned Node in Docker, so a host needs only
# Docker (no local Node/nvm). The Node version tracks .nvmrc. dist/ is written
# to the host and mounted into the Grafana dev server by docker-compose.
#
#   make up      build dist/ then start Grafana on http://localhost:3000
#   make dev     watch build (rebuilds dist/ on change); run compose separately
#
# Note: this shares node_modules with the host tree. It is safe when host and
# container share an OS/arch (Linux here). On a macOS/Windows host, run these
# targets exclusively (do not mix with a host `npm install`) to avoid clashing
# native binaries.

NODE_IMAGE := node:22
UID := $(shell id -u)
GID := $(shell id -g)

# Run an npm command in a throwaway Node container, as the host user so the
# generated files (dist/, node_modules/) stay host-owned.
NODE_RUN := docker run --rm -u $(UID):$(GID) \
	-e npm_config_cache=/tmp/.npm -e WATCHPACK_POLLING=true \
	-v $(CURDIR):/work -w /work $(NODE_IMAGE)

.DEFAULT_GOAL := help

.PHONY: help build dev up restart down logs clean

help: ## Show the available targets
	@grep -hE '^[a-z-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN{FS=":.*## "}{printf "  \033[36m%-9s\033[0m %s\n", $$1, $$2}'

build: ## Install deps and produce a production dist/ (Node in Docker)
	$(NODE_RUN) sh -lc 'npm ci && npm run build'

dev: ## Install deps and watch-build dist/ (Ctrl-C to stop)
	$(NODE_RUN) sh -lc 'npm ci && npm run dev'

up: build ## Build dist/ then start the Grafana dev server
	docker compose up -d
	@echo 'Grafana: http://localhost:3000'

restart: ## Restart Grafana so it rescans the plugins directory
	docker compose restart

down: ## Stop the Grafana dev server
	docker compose down

logs: ## Follow the Grafana logs
	docker compose logs -f grafana

clean: ## Remove dist/ and node_modules
	$(NODE_RUN) sh -lc 'rm -rf dist node_modules'
