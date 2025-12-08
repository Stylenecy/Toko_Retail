# Troubleshooting Guide - Toko Retail

Common issues and solutions when setting up and running the Toko Retail inventory system.

---

## Database Connection Issues

### Problem: "connect ECONNREFUSED 127.0.0.1:3306"

**Cause**: MySQL server is not running

**Solutions**:

**macOS:**
```bash
# Start MySQL using Homebrew
mysql.server start

# Or
brew services start mysql

# Check status
mysql.server status
```

**Linux:**
```bash
# Start MySQL service
sudo service mysql start

# Check status
sudo service mysql status

# Or with systemd
sudo systemctl start mysql
sudo systemctl status mysql
```

**Windows:**
```bash
# Start from Services (Win + R -> services.msc)
# Or from Command Prompt (as Administrator)
net start MySQL80

# To stop
net stop MySQL80
```

### Problem: "ER_ACCESS_DENIED_FOR_USER 'root'@'localhost'"

**Cause**: Wrong database password in `.env`

**Solution**:
```bash
# 1. Verify MySQL password
mysql -u root -p
# Enter your MySQL password

# 2. Update .env with correct password
# Edit .env and set:
DB_PASSWORD=your_actual_mysql_password

# 3. Restart server
npm run dev
```

### Problem: "Unknown database 'toko_retail'"

**Cause**: Database not created yet

**Solution**:
```bash
# Create database
mysql -u root -p
CREATE DATABASE toko_retail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Run migrations
npm run migrate

# Seed data
npm run seed
```

### Problem: "Table 'toko_retail.Users' doesn't exist"

**Cause**: Migrations haven't been run yet

**Solution**:
```bash
# Run all migrations
npm run migrate

# Verify tables were created
mysql -u root -p toko_retail
SHOW TABLES;
EXIT;
```

---

## Server Startup Issues

### Problem: "Port 3000 already in use"

**Cause**: Another application is using port 3000

**Solutions**:

**Option 1: Kill process using the port**
```bash
# macOS/Linux
lsof -i :3000
# Get the PID and kill it
kill -9 <PID>

# Windows (Command Prompt as Administrator)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Option 2: Use different port**
```bash
# Edit .env
PORT=3001

# Restart server
npm run dev
```

### Problem: "Cannot find module 'express'" (or other dependency)

**Cause**: Dependencies not installed

**Solution**:
```bash
# Install all dependencies
npm install

# Verify installation
npm list

# If still issues, try clean install
rm -rf node_modules
rm package-lock.json
npm install
```

### Problem: Server starts but gives "Database connection error"

**Cause**: Configuration issue

**Solutions**:
```bash
# 1. Check .env file exists
cat .env

# 2. Verify all required variables are set
# Required: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET

# 3. Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# 4. Test connection manually
mysql -u root -p -h localhost -D toko_retail

# 5. Check for typos in .env
# Common issues: extra spaces, missing quotes
```

---

## Authentication Issues

### Problem: "Invalid or expired token"

**Cause**: Token has expired or is malformed

**Solution**:
```bash
# Get new token by logging in again
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Save the new token
export TOKEN="new_token_here"
```

### Problem: Login returns "Invalid username or password"

**Cause**: Wrong credentials or user doesn't exist

**Solutions**:
```bash
# 1. Use default credentials
# Username: admin
# Password: admin123

# 2. Check if seeders ran
mysql -u root -p toko_retail
SELECT * FROM Users;
EXIT;

# 3. If no users, run seeders
npm run seed
```

### Problem: "No token provided" when accessing protected endpoints

**Cause**: Missing Authorization header

**Solution**:
```bash
# Correct format
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer your_token_here"

# Wrong format (missing "Bearer")
# curl -X GET http://localhost:3000/api/products \
#   -H "Authorization: your_token_here"
```

---

## API Request Issues

### Problem: "Validation failed" response

**Cause**: Invalid input data

**Solutions**:
```bash
# Check error details in response
# Example: missing required field

# For products, required fields are:
# - sku (unique)
# - name
# - unitPrice
# - quantityInStock
# - supplierId

# Make sure all required fields are provided
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-001",
    "name": "Product Name",
    "unitPrice": 10000.00,
    "quantityInStock": 50,
    "supplierId": 1
  }'
```

### Problem: "Insufficient stock for product"

**Cause**: Trying to sell more than available

**Solution**:
```bash
# Check available stock
curl -X GET http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"

# Adjust quantity in transaction
# Or add stock first with stock_in transaction

curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "stock_in",
    "userId": 1,
    "items": [{
      "productId": 1,
      "quantity": 100,
      "unitPrice": 8000
    }]
  }'
```

### Problem: "SKU already exists"

**Cause**: SKU is not unique

**Solution**:
```bash
# Check existing SKUs
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"

# Use different SKU
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-UNIQUE-123",  # Change this
    "name": "Product",
    "unitPrice": 10000,
    "quantityInStock": 50,
    "supplierId": 1
  }'
```

### Problem: "Cannot delete supplier with associated products"

**Cause**: Supplier has products linked to it

**Solution**:
```bash
# Option 1: Delete products first
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"

# Then delete supplier
curl -X DELETE http://localhost:3000/api/suppliers/1 \
  -H "Authorization: Bearer $TOKEN"

# Option 2: Create new supplier without products
curl -X POST http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empty Supplier",
    "contact": "Contact",
    "address": "Address"
  }'
```

### Problem: "Insufficient permissions" (403 Forbidden)

**Cause**: User role doesn't have access

**Solutions**:
```bash
# Check your user role
# Staff users cannot create/delete products and suppliers

# Login as admin instead
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Or use staff account for transactions (allowed)
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Database & Data Issues

### Problem: Data not showing after migration

**Cause**: Seeders haven't been run

**Solution**:
```bash
# Run seeders to insert sample data
npm run seed

# Verify data
mysql -u root -p toko_retail
SELECT COUNT(*) FROM Users;
SELECT COUNT(*) FROM Products;
SELECT COUNT(*) FROM Suppliers;
EXIT;
```

### Problem: Can't find product/supplier by ID

**Cause**: Wrong ID or data was deleted

**Solutions**:
```bash
# List all products to find correct IDs
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"

# Check database directly
mysql -u root -p toko_retail
SELECT id, name FROM Products;
EXIT;
```

### Problem: Stock not updating after transaction

**Cause**: Transaction creation failed silently

**Solutions**:
```bash
# Check error logs
tail -f logs/error.log

# Verify transaction was created
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN"

# Check database directly
mysql -u root -p toko_retail
SELECT * FROM Transactions ORDER BY id DESC LIMIT 1;
SELECT * FROM Products WHERE id = 1;
EXIT;
```

### Problem: Need to reset database completely

**Solution**:
```bash
# 1. Drop database
mysql -u root -p -e "DROP DATABASE IF EXISTS toko_retail;"

# 2. Create fresh database
mysql -u root -p -e "CREATE DATABASE toko_retail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Run migrations and seeders
npm run db:reset

# Verify
mysql -u root -p toko_retail
SHOW TABLES;
SELECT COUNT(*) FROM Users;
EXIT;
```

---

## Logging & Debugging

### Enable Detailed Logging

```bash
# Edit .env
LOG_LEVEL=debug
DEBUG=*

# Restart server
npm run dev
```

### View Error Logs

```bash
# Real-time error logs
tail -f logs/error.log

# All logs
tail -f logs/combined.log

# Last 50 lines
tail -n 50 logs/error.log

# Clear logs
rm logs/*.log
```

### Check Server Logs for Issues

```bash
# Run dev server with visible logs
npm run dev

# Look for error messages
# Common messages:
# [error]: Database connection error
# [error]: Migration failed
# [error]: Authentication error
```

---

## Environment Issues

### Problem: .env file not being read

**Cause**: .env file doesn't exist or is in wrong location

**Solutions**:
```bash
# 1. Create .env from template
cp .env.example .env

# 2. Verify file exists in root directory
ls -la | grep .env

# 3. Check file is not empty
cat .env

# 4. Restart server
npm run dev
```

### Problem: Environment variables have special characters

**Cause**: Special characters need escaping

**Solution**:
```bash
# Correct format with special characters
# Use quotes
DB_PASSWORD="p@ss&word123"

# Or escape special characters
DB_PASSWORD=p\@ss\&word123

# Restart server
npm run dev
```

---

## Common Mistakes

### Mistake 1: Forgetting Bearer in Authorization header
```bash
# Wrong
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: eyJhbGc..."

# Correct
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer eyJhbGc..."
```

### Mistake 2: Not setting Content-Type for POST/PUT
```bash
# Wrong
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -d '{...}'

# Correct
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Mistake 3: Using wrong token for different users
```bash
# Get token for admin
ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | jq -r '.data.token')

# Use correct token
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

### Mistake 4: Database password in quotes or special handling
```bash
# .env file - no quotes needed
DB_PASSWORD=mypassword123

# If password has special chars, might need quotes
DB_PASSWORD="my@pass&word"

# But in shell commands, still need -p flag
mysql -u root -p -h localhost
# Then enter password when prompted
```

---

## Performance Issues

### Problem: Slow queries

**Solutions**:
```bash
# 1. Check indexes are created
mysql -u root -p toko_retail
SHOW INDEX FROM Products;
SHOW INDEX FROM Transactions;
EXIT;

# 2. Use pagination to limit results
# Good
curl -X GET "http://localhost:3000/api/products?limit=50" \
  -H "Authorization: Bearer $TOKEN"

# Bad (gets all at once)
curl -X GET "http://localhost:3000/api/products" \
  -H "Authorization: Bearer $TOKEN"
```

### Problem: High memory usage

**Cause**: Node process accumulating data

**Solution**:
```bash
# Restart the server periodically
# Or monitor memory usage

# Check process
ps aux | grep node

# Restart
npm run dev
```

---

## Getting Help

If you've tried these solutions and still have issues:

1. **Check logs**: `tail -f logs/error.log`
2. **Verify MySQL**: `mysql -u root -p -e "SELECT 1;"`
3. **Check .env**: `cat .env`
4. **Review README**: `README.md` and `SETUP.md`
5. **Verify steps in SETUP.md**: Ensure all setup steps were completed
6. **Check API-TESTING.md**: Test with provided examples

---

## Quick Diagnostic Commands

Run these to quickly diagnose issues:

```bash
# Check all prerequisites
node --version
npm --version
mysql --version

# Check MySQL connection
mysql -u root -p -e "SELECT 1;"

# Verify Node modules installed
npm list | head -20

# Check .env file
cat .env | grep -E "DB_|JWT_"

# Check database exists
mysql -u root -p -e "SHOW DATABASES LIKE 'toko_retail';"

# Check tables exist
mysql -u root -p toko_retail -e "SHOW TABLES;"

# Check migrations ran
mysql -u root -p toko_retail -e "SELECT COUNT(*) FROM Users;"
```

---

## Still Stuck?

1. **Save error message** - Copy the exact error text
2. **Check logs** - Review logs/error.log for details
3. **Verify setup** - Re-read SETUP.md step by step
4. **Test in isolation** - Test database, test API separately
5. **Review README** - Check API documentation in README.md

The system is designed to be straightforward. Most issues are:
- MySQL not running
- Wrong password in .env
- Missing migrations/seeders
- Wrong token format
- Invalid input data