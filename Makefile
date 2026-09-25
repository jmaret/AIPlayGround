.PHONY: dev web api check-ollama install install-web install-api fixtures pages

WEB_HOST ?= localhost
WEB_PORT ?= 3010
API_HOST ?= localhost
API_PORT ?= 8000
PAGES_BASE ?=

install: install-web install-api

install-web:
	cd apps/web && npm install

install-api:
	python3 -m venv .venv
	.venv/bin/pip install -r apps/api/requirements.txt

check-ollama:
	@curl -sf http://localhost:11434/api/tags > /dev/null && echo "Ollama is reachable on localhost:11434" || (echo "Ollama is not running. Install from https://ollama.com then: ollama pull llama3.2 && ollama pull nomic-embed-text" && exit 1)

web:
	cd apps/web && npm run dev

api:
	.venv/bin/uvicorn app.main:app --app-dir apps/api --host $(API_HOST) --port $(API_PORT) --reload

dev:
	@curl -sf http://localhost:11434/api/tags > /dev/null && echo "Ollama is reachable" || echo "Warning: Ollama is not running. Labs need: ollama pull llama3.2 && ollama pull nomic-embed-text"
	@echo "Starting API on $(API_HOST):$(API_PORT) and web on $(WEB_HOST):$(WEB_PORT)"
	@$(MAKE) -j2 web api

fixtures:
	.venv/bin/python scripts/record_lab_fixtures.py

pages:
	cd apps/web && STATIC_EXPORT=1 NEXT_PUBLIC_STATIC=1 NEXT_PUBLIC_BASE_PATH=$(PAGES_BASE) npm run build
