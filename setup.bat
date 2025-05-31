@echo off
echo 🚀 Setting up WatchParty development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo [SUCCESS] Node.js version: 
node --version

REM Check if MongoDB is running (Windows)
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe" >nul
if errorlevel 1 (
    echo [WARNING] MongoDB is not running. Please start MongoDB before running the application.
    echo [INFO] Start MongoDB as a Windows service or run: mongod
)

REM Backend setup
echo [INFO] Setting up backend...
cd backend

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
call npm install

REM Copy environment files if they don't exist
if not exist ".env" (
    echo [INFO] Creating backend .env file...
    copy .env.example .env
    echo [WARNING] Please update backend/.env with your configuration
) else (
    echo [WARNING] Backend .env already exists. Please verify your configuration.
)

REM Copy JWT config if it doesn't exist
if not exist "src\config\jwt.ts" (
    echo [INFO] Creating JWT configuration...
    copy src\config\jwt.ts.example src\config\jwt.ts
    echo [WARNING] Please update backend/src/config/jwt.ts with your JWT secret
) else (
    echo [WARNING] JWT config already exists. Please verify your configuration.
)

REM Frontend setup
echo [INFO] Setting up frontend...
cd ..\frontend

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
call npm install

REM Copy environment files if they don't exist
if not exist ".env" (
    echo [INFO] Creating frontend .env file...
    copy .env.example .env
    echo [SUCCESS] Frontend .env created
) else (
    echo [SUCCESS] Frontend .env already exists
)

REM Go back to root directory
cd ..

echo.
echo [SUCCESS] Setup completed! 🎉
echo.
echo [INFO] Next steps:
echo 1. Update backend/.env with your MongoDB URI and JWT secret
echo 2. Update backend/src/config/jwt.ts with the same JWT secret
echo 3. Start MongoDB service or run: mongod
echo 4. Start backend: cd backend ^&^& npm run dev
echo 5. Start frontend: cd frontend ^&^& npm run dev
echo.
echo [INFO] The application will be available at:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8081
echo.
echo [WARNING] Don't forget to generate a secure JWT secret for production!
echo    Generate one with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
echo.
pause
