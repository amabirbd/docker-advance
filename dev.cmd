@echo off
cd /d "%~dp0"
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build