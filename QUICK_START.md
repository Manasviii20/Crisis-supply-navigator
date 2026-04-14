# Quick Start Guide - Crisis Supply Navigator Backend

## Fast Setup (5 Minutes)

### Prerequisites Check
- [ ] Node.js installed (run: `node --version`)
- [ ] MySQL installed and running

### Step-by-Step

#### 1. Install Node.js (if not installed)
Download from: https://nodejs.org/ (LTS version)

#### 2. Setup MySQL Database
Open MySQL command line and run:
```sql
CREATE DATABASE crisis_supply_navigator;
```

#### 3. Configure Database Connection
Open `.env` file and update:
```env
DB_PASSWORD=your_mysql_password_here
```

#### 4. Install and Setup
Open terminal in project folder and run:
```bash
# Install dependencies
npm install

# Seed database with sample data
npm run seed

# Start server
npm run dev
```

#### 5. Access Application
- Frontend: http://localhost:3000
- API Health: http://localhost:3000/api/health

**Default Login:**
- Email: admin@crisisnavigator.com
- Password: admin123

## API Testing Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@crisisnavigator.com\",\"password\":\"admin123\"}"
```

### Get Supplies
```bash
curl http://localhost:3000/api/supplies
```

### Get Shelters
```bash
curl http://localhost:3000/api/shelters
```

## Common Commands

```bash
# Start development server (auto-restart)
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Install dependencies
npm install
```

## Troubleshooting

**Error: MySQL connection failed**
- Check MySQL service is running
- Verify password in `.env` file
- Ensure database exists

**Error: Port 3000 already in use**
- Change PORT in `.env` to another port (e.g., 3001)

**Error: Module not found**
- Run `npm install` again

## Need Help?
See full documentation in `BACKEND_SETUP.md`
