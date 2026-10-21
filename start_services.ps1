Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting SereneMind Mental Health Journal Platform" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan

# 1. ML Service
Write-Host "[1/3] Launching Python FastAPI ML Service on port 8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'app'; python run.py"

# 2. Spring Boot Backend
Write-Host "[2/3] Launching Java Spring Boot Backend on port 8080..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'backend'; mvn spring-boot:run"

# 3. React Frontend
Write-Host "[3/3] Launching React Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'frontend'; npm run dev"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "All 3 services launched! Access app at http://localhost:5173" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
