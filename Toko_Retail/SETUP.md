# Toko Retail - Complete Setup & Implementation Guide

## Prerequisites Check

Before starting, verify you have:
```bash
# Check Node.js
node --version          # Should be v14 or higher
npm --version           # Should be v6 or higher

# Check MySQL
mysql --version         # Should be v5.7 or higher
```

If any are missing, install them first.

---

## Step 1: Environment Setup

### 1.1 Create Database

```bash
# Start MySQL
mysql -u root -p

# Create database
CREATE DATABASE toko_retail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify creation
SHOW DATABASES;

# Exit MySQL
EXIT;
```

### 1.2 Configure Environment Variables

```bash
# Copy template
cp .env.example .env

# Edit .env file with your settings
```

Example `.env` content:
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=toko_retail
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRY=24h
CORS_ORIGIN=*
```

**Important**: Change `DB_PASSWORD` and `JWT_SECRET` to secure values.

---

## Step 2: Install Dependencies

```bash
# Navigate to project
cd Toko_Retail

# Install npm packages
npm install

# Verify installation
npm list

# Output should show all dependencies installed without errors
```

**Expected packages:**
- express ^4.18.2
- sequelize ^6.35.2
- mysql2 ^3.6.5
- jsonwebtoken ^9.0.2
- bcryptjs ^2.4.3
- joi ^17.11.0
- winston ^3.11.0
- helmet ^7.1.0
- cors ^2.8.5
- dotenv ^16.3.1

---

## Step 3: Database Migrations & Seeders

### 3.1 Option A: Automatic Setup (Recommended)

```bash
# This runs migrations + seeders in one command
npm run db:reset
```

### 3.2 Option B: Manual Step-by-Step

```bash
# Run migrations (creates tables)
npm run migrate

# Seed sample data
npm run seed

# Verify tables
mysql -u root -p toko_retail
SHOW TABLES;
SELECT * FROM Users;
EXIT;
```

### 3.3 Check Database

```bash
# Connect to database
mysql -u root -p toko_retail

# Verify tables exist
SHOW TABLES;

# Check sample data
SELECT * FROM Users;
SELECT COUNT(*) as products FROM Products;
SELECT COUNT(*) as suppliers FROM Suppliers;

# Exit
EXIT;
```

---

## Step 4: Start Development Server

### 4.1 Development Mode (Hot Reload)

```bash
npm run dev
```

Expected output:
```
2024-01-15 10:30:45 [info]: Database connection established successfully
2024-01-15 10:30:45 [info]: Server is running on port 3000
2024-01-15 10:30:45 [info]: Environment: development
```

### 4.2 Production Mode

```bash
npm start
```

### 4.3 Verify Server is Running

Open new terminal:
```bash
# Test health check
curl http://localhost:3000/health

# Should respond:
# {"success":true,"message":"Server is running","timestamp":"2024-01-15T10:30:45.000Z"}
```

---

## Step 5: Test Authentication

### 5.1 Login with Default Credentials

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save this token!** You'll use it for all other requests.

### 5.2 Store Token for Testing

```bash
# Save token as variable (Linux/Mac)
export TOKEN="your_jwt_token_here"

# Verify
echo $TOKEN
```

---

## Step 6: Verify API Endpoints

### 6.1 Test Products Endpoint

```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

Expected: List of 10 products with pagination info

### 6.2 Test Suppliers Endpoint

```bash
curl -X GET http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer $TOKEN"
```

Expected: List of 4 suppliers

### 6.3 Test Create Transaction

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "userId": 1,
    "notes": "Test transaction",
    "items": [
      {
        "productId": 1,
        "quantity": 5,
        "unitPrice": 28000.00
      }
    ]
  }'
```

Expected: Transaction created with updated stock

---

## Step 7: Verify Database Changes

After creating a transaction, check the database:

```bash
mysql -u root -p toko_retail

# Check product stock was updated
SELECT id, name, quantityInStock FROM Products WHERE id = 1;

# Check transaction was recorded
SELECT * FROM Transactions ORDER BY id DESC LIMIT 1;

# Check transaction items
SELECT * FROM TransactionItems ORDER BY id DESC LIMIT 1;

EXIT;
```

---

## Complete Quick Setup Script

Run this all at once (paste into terminal):

```bash
#!/bin/bash

echo "=== Toko Retail Setup ==="
echo ""

echo "1. Installing dependencies..."
npm install

echo ""
echo "2. Creating database..."
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS toko_retail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo ""
echo "3. Running migrations..."
npm run migrate

echo ""
echo "4. Seeding sample data..."
npm run seed

echo ""
echo "5. Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env with your database password"
echo "  2. Run: npm run dev"
echo "  3. Test with: curl http://localhost:3000/health"
echo ""
```

---

## Database Reset (If Needed)

If you need to completely reset and start over:

```bash
# Drop database
mysql -u root -p -e "DROP DATABASE IF EXISTS toko_retail;"

# Create fresh database
mysql -u root -p -e "CREATE DATABASE toko_retail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations and seeders
npm run db:reset
```

---

## Environment Files Summary

### .env File Locations
- **Development**: `.env` (don't commit)
- **Template**: `.env.example` (commit this)

### Required Variables
```
NODE_ENV              # development, production, test
PORT                  # 3000 (or your preferred port)
DB_HOST              # localhost
DB_PORT              # 3306
DB_NAME              # toko_retail
DB_USER              # root
DB_PASSWORD          # your_password
JWT_SECRET           # strong_secret_key
JWT_EXPIRY           # 24h
CORS_ORIGIN          # * or specific domain
```

---

## Logs and Debugging

### View Logs
```bash
# Real-time logs (development mode shows in console)
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log

# Clear logs
rm logs/*.log
```

### Enable Debug Mode
Add to .env:
```
LOG_LEVEL=debug
DEBUG=*
```

---

## Verification Checklist

After setup, verify:

- [ ] Node.js v14+ installed
- [ ] MySQL running
- [ ] Database `toko_retail` created
- [ ] `.env` file configured
- [ ] `npm install` completed
- [ ] Migrations ran successfully
- [ ] Seeders completed (check Users table has 3 rows)
- [ ] Server starts without errors
- [ ] Health check returns success
- [ ] Login returns JWT token
- [ ] Can access /api/products with token
- [ ] Can create transaction and stock updates

---

## Common Issues & Solutions

### "connect ECONNREFUSED"
```bash
# MySQL not running
# macOS:
mysql.server start

# Linux:
sudo service mysql start

# Windows:
# Start MySQL from Services or cmd: net start MySQL80
```

### "ER_ACCESS_DENIED_FOR_USER"
```bash
# Wrong database password in .env
# Update .env with correct MySQL password
```

### "Table 'toko_retail.Users' doesn't exist"
```bash
# Migrations didn't run
npm run migrate
```

### "Port 3000 already in use"
```bash
# Kill process using port 3000
# macOS/Linux:
lsof -i :3000
kill -9 <PID>

# Or change PORT in .env to different value like 3001
```

---

## Next Steps

1. **For Testing**: See `API-TESTING.md`
2. **For Production**: Update .env with production settings
3. **For Frontend Integration**: Use endpoints documented in `README.md`
4. **For Troubleshooting**: See `TROUBLESHOOTING.md`

---

## Support

If you encounter issues:
1. Check logs in `/logs` directory
2. Verify MySQL is running: `mysql -u root -p -e "SELECT 1;"`
3. Check .env configuration
4. Review error messages in console
5. Check TROUBLESHOOTING.md for specific issues