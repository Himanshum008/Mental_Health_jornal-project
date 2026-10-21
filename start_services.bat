@echo off
echo ========================================================
echo   Starting SereneMind Mental Health Journal Platform
echo ========================================================

echo [1/3] Starting Python ML Service (Port 8000)...
start "SereneMind - Python ML Service (Port 8000)" cmd /k "cd app && python run.py"

echo [2/3] Starting Java Spring Boot Backend (Port 8080)...
start "SereneMind - Spring Boot Backend (Port 8080)" cmd /k "cd backend && mvn spring-boot:run"

echo [3/3] Starting React Frontend (Port 5173)...
start "SereneMind - React Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo ========================================================
echo All services launched!
echo Access the application at: http://localhost:5173
echo ========================================================
pause
