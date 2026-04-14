# Crisis Supply Navigator - Backend Setup Guide

## Overview
Complete backend API for the Crisis Supply Navigator system using Node.js, Express, and MySQL.

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm (comes with Node.js)

## Installation Steps

### 1. Install Node.js
If not already installed:
- Download from: https://nodejs.org/
- Install the LTS version
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Install MySQL
If not already installed:
- Download from: https://dev.mysql.com/downloads/mysql/
- Install and remember your root password
- Start MySQL service

### 3. Create Database
Open MySQL command line or MySQL Workbench and run:
```sql
CREATE DATABASE crisis_supply_navigator;
```

### 4. Configure Environment
Edit the `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=crisis_supply_navigator
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

**Important:** Replace `your_mysql_password_here` with your actual MySQL root password.

### 5. Install Dependencies
Open terminal in project directory and run:
```bash
npm install
```

This will install:
- express - Web framework
- mysql2 - MySQL driver
- cors - Cross-origin resource sharing
- dotenv - Environment variables
- bcryptjs - Password hashing
- jsonwebtoken - Authentication tokens
- body-parser - Request body parsing
- nodemon - Development auto-restart

### 6. Seed Database (Optional but Recommended)
Populate database with sample data:
```bash
npm run seed
```

This creates:
- 10 sample supplies
- 5 shelters with occupancy data
- 5 delivery records
- 3 user accounts (admin, coordinator, volunteer)

**Default Admin Credentials:**
- Email: admin@crisisnavigator.com
- Password: admin123

### 7. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Supplies
- `GET /api/supplies` - Get all supplies
- `GET /api/supplies/statistics` - Get supply statistics
- `GET /api/supplies/:id` - Get supply by ID
- `POST /api/supplies` - Create supply (requires auth)
- `PUT /api/supplies/:id` - Update supply (requires auth)
- `DELETE /api/supplies/:id` - Delete supply (requires admin)

### Shelters
- `GET /api/shelters` - Get all shelters
- `GET /api/shelters/statistics` - Get shelter statistics
- `GET /api/shelters/:id` - Get shelter by ID
- `POST /api/shelters` - Create shelter (requires auth)
- `PUT /api/shelters/:id` - Update shelter (requires auth)
- `PATCH /api/shelters/:id/occupancy` - Update occupancy
- `DELETE /api/shelters/:id` - Delete shelter (requires admin)

### Deliveries
- `GET /api/deliveries` - Get all deliveries
- `GET /api/deliveries/today` - Get today's deliveries
- `GET /api/deliveries/statistics` - Get delivery statistics
- `GET /api/deliveries/:id` - Get delivery by ID
- `POST /api/deliveries` - Create delivery (requires auth)
- `PUT /api/deliveries/:id` - Update delivery (requires auth)
- `PATCH /api/deliveries/:id/status` - Update status
- `DELETE /api/deliveries/:id` - Delete delivery (requires admin)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `GET /api/admin/statistics` - Get comprehensive statistics
- `GET /api/admin/dashboard` - Get dashboard overview

### Health Check
- `GET /api/health` - API status check

## Testing the API

### Using cURL
Test health endpoint:
```bash
curl http://localhost:3000/api/health
```

Login to get token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@crisisnavigator.com\",\"password\":\"admin123\"}"
```

Get supplies (with token):
```bash
curl http://localhost:3000/api/supplies \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Import the API endpoints
2. Set base URL to `http://localhost:3000/api`
3. For authenticated routes, add header: `Authorization: Bearer YOUR_TOKEN`

## Frontend Integration

The frontend is automatically served by the Express server:
- Home: http://localhost:3000/
- Dashboard: http://localhost:3000/dashboard
- Supplies: http://localhost:3000/supplies
- Shelters: http://localhost:3000/shelters
- Deliveries: http://localhost:3000/deliveries
- Map: http://localhost:3000/map
- Admin: http://localhost:3000/admin

## Database Schema

### Tables Created:
1. **supplies** - Emergency supply inventory
2. **shelters** - Shelter locations and capacity
3. **deliveries** - Delivery tracking
4. **users** - User accounts with roles
5. **activity_logs** - System activity tracking

All tables include timestamps and proper indexing for performance.

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control (admin, coordinator, volunteer)
- Protected API endpoints
- CORS enabled for cross-origin requests
- SQL injection prevention with parameterized queries

## Troubleshooting

### MySQL Connection Failed
- Verify MySQL service is running
- Check credentials in `.env` file
- Ensure database exists
- Check MySQL port (default: 3306)

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:3000 | xargs kill -9
  ```

### Module Not Found
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

## Project Structure

```
crisis-supply-navigator/
├── database/
│   ├── config.js       # MySQL connection pool
│   ├── schema.js       # Database schema creation
│   └── seed.js         # Sample data seeding
├── models/
│   ├── Supply.js       # Supply model
│   ├── Shelter.js      # Shelter model
│   ├── Delivery.js     # Delivery model
│   └── User.js         # User model
├── routes/
│   ├── auth.js         # Authentication routes
│   ├── supplies.js     # Supply routes
│   ├── shelters.js     # Shelter routes
│   ├── deliveries.js   # Delivery routes
│   └── admin.js        # Admin routes
├── middleware/
│   └── auth.js         # Authentication middleware
├── frontend/           # Frontend files
├── server.js           # Main server file
├── package.json        # Dependencies
└── .env                # Environment variables
```

## Next Steps

1. Customize the JWT_SECRET in production
2. Set up MySQL backups
3. Configure HTTPS for production
4. Add rate limiting for API security
5. Implement email notifications
6. Add real-time updates with WebSockets

## Support

For issues or questions, check:
- Server logs in terminal
- MySQL error logs
- Browser console for frontend errors
- API response messages
