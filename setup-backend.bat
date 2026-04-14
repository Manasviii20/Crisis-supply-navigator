@echo off
echo ========================================
echo Crisis Supply Navigator - Backend Setup
echo ========================================
echo.

echo Step 1: Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found!
echo.

echo Step 2: Checking MySQL installation...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MySQL command line not found in PATH
    echo Please ensure MySQL is installed and running
    echo.
)
echo.

echo Step 3: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo Dependencies installed successfully!
echo.

echo Step 4: Checking environment configuration...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create .env file with your MySQL credentials
    pause
    exit /b 1
)
echo Environment file found!
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure MySQL is running
echo 2. Create database: crisis_supply_navigator
echo 3. Update .env file with your MySQL password
echo 4. Run: npm run seed (to add sample data)
echo 5. Run: npm run dev (to start server)
echo.
echo See BACKEND_SETUP.md for detailed instructions
echo.
pause
