# API Testing Guide - Toko Retail

Complete guide to test all API endpoints with curl commands.

## Getting Started

### 1. Start the Server

```bash
npm run dev
# Server running on http://localhost:3000
```

### 2. Get JWT Token

```bash
# Login as admin (default credentials)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response will include JWT token. Save it:**

```bash
# Store token in environment variable (Linux/Mac)
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# For Windows (Command Prompt)
set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Health Check (No Auth Required)

```bash
curl -X GET http://localhost:3000/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:45.000Z"
}
```

---

## Authentication Endpoints

### Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "role": "staff"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 4,
    "username": "newuser",
    "role": "staff",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## Product Endpoints

### GET All Products (with Pagination)

```bash
# Basic - get first 20 products
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl -X GET "http://localhost:3000/api/products?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Filter by supplier
curl -X GET "http://localhost:3000/api/products?supplierId=1" \
  -H "Authorization: Bearer $TOKEN"

# Search by name or SKU
curl -X GET "http://localhost:3000/api/products?searchTerm=Minyak" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters
curl -X GET "http://localhost:3000/api/products?page=1&limit=10&supplierId=1&searchTerm=oil" \
  -H "Authorization: Bearer $TOKEN"
```

### GET Product by ID

```bash
curl -X GET http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

### CREATE Product (Admin Only)

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-NEW-001",
    "name": "Garam Kaya",
    "description": "Premium salt 1kg",
    "unitPrice": 8000.00,
    "quantityInStock": 100,
    "reorderThreshold": 40,
    "supplierId": 1
  }'
```

### UPDATE Product (Admin Only)

```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minyak Goreng Premium 2L",
    "description": "Premium cooking oil - updated",
    "unitPrice": 30000.00,
    "reorderThreshold": 25,
    "supplierId": 1
  }'
```

### DELETE Product (Admin Only)

```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Supplier Endpoints

### GET All Suppliers

```bash
# All suppliers
curl -X GET http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl -X GET "http://localhost:3000/api/suppliers?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Search supplier
curl -X GET "http://localhost:3000/api/suppliers?searchTerm=Maju" \
  -H "Authorization: Bearer $TOKEN"
```

### GET Supplier by ID

```bash
curl -X GET http://localhost:3000/api/suppliers/1 \
  -H "Authorization: Bearer $TOKEN"
```

### CREATE Supplier (Admin Only)

```bash
curl -X POST http://localhost:3000/api/suppliers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CV Baru Makmur",
    "contact": "Tri Wahyono",
    "address": "Jl. Merdeka No. 100, Yogyakarta"
  }'
```

### UPDATE Supplier (Admin Only)

```bash
curl -X PUT http://localhost:3000/api/suppliers/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "PT Maju Jaya Updated",
    "contact": "Budi Santoso - Updated",
    "address": "Jl. Industri No. 45, Jakarta Utara"
  }'
```

### DELETE Supplier (Admin Only)

```bash
curl -X DELETE http://localhost:3000/api/suppliers/4 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Transaction Endpoints

### GET All Transactions

```bash
# All transactions
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN"

# With pagination
curl -X GET "http://localhost:3000/api/transactions?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Filter by type (sale, stock_in, stock_out, return)
curl -X GET "http://localhost:3000/api/transactions?type=sale" \
  -H "Authorization: Bearer $TOKEN"

# Filter by user
curl -X GET "http://localhost:3000/api/transactions?userId=1" \
  -H "Authorization: Bearer $TOKEN"

# Filter by date range
curl -X GET "http://localhost:3000/api/transactions?dateFrom=2024-01-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters
curl -X GET "http://localhost:3000/api/transactions?type=sale&userId=1&dateFrom=2024-01-01" \
  -H "Authorization: Bearer $TOKEN"
```

### GET Transaction by ID

```bash
curl -X GET http://localhost:3000/api/transactions/1 \
  -H "Authorization: Bearer $TOKEN"
```

### CREATE Transaction (Sale - Decreases Stock)

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "userId": 1,
    "notes": "Sale to customer ABC",
    "items": [
      {
        "productId": 1,
        "quantity": 5,
        "unitPrice": 28000.00
      },
      {
        "productId": 2,
        "quantity": 3,
        "unitPrice": 12000.00
      }
    ]
  }'
```

### CREATE Transaction (Stock In - Increases Stock)

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "stock_in",
    "userId": 1,
    "notes": "Received from supplier",
    "items": [
      {
        "productId": 1,
        "quantity": 50,
        "unitPrice": 25000.00
      }
    ]
  }'
```

### CREATE Transaction (Return - Increases Stock)

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "return",
    "userId": 1,
    "notes": "Customer return",
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "unitPrice": 28000.00
      }
    ]
  }'
```

### DELETE Transaction (Reverses Stock - Admin Only)

```bash
curl -X DELETE http://localhost:3000/api/transactions/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Report Endpoints

### Stock Report

```bash
curl -X GET http://localhost:3000/api/reports/stock \
  -H "Authorization: Bearer $TOKEN"
```

**Response includes:**
- Total products
- Low stock count
- Total inventory value
- Detailed product list with stock status

### Sales Report

```bash
# All sales
curl -X GET http://localhost:3000/api/reports/sales \
  -H "Authorization: Bearer $TOKEN"

# By type
curl -X GET "http://localhost:3000/api/reports/sales?type=sale" \
  -H "Authorization: Bearer $TOKEN"

# By product
curl -X GET "http://localhost:3000/api/reports/sales?productId=1" \
  -H "Authorization: Bearer $TOKEN"

# By date range
curl -X GET "http://localhost:3000/api/reports/sales?dateFrom=2024-01-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"

# Combined
curl -X GET "http://localhost:3000/api/reports/sales?type=sale&dateFrom=2024-01-01&productId=1" \
  -H "Authorization: Bearer $TOKEN"
```

**Response includes:**
- Period information
- Transaction counts by type
- Revenue by product
- Total revenue

### Dashboard Statistics

```bash
curl -X GET http://localhost:3000/api/reports/dashboard/stats \
  -H "Authorization: Bearer $TOKEN"
```

**Response includes:**
- Total products
- Total suppliers
- Total transactions
- Low stock products count
- Inventory metrics

---

## Error Scenarios (Testing Error Handling)

### Test Unauthorized Access (No Token)

```bash
curl -X GET http://localhost:3000/api/products
```

**Expected: 401 Unauthorized**

### Test Invalid Token

```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer invalid_token_123"
```

**Expected: 401 Unauthorized**

### Test Insufficient Stock (Overselling)

```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "userId": 1,
    "notes": "Try to sell too much",
    "items": [
      {
        "productId": 1,
        "quantity": 99999,
        "unitPrice": 28000.00
      }
    ]
  }'
```

**Expected: 400 Bad Request - Insufficient stock**

### Test Duplicate SKU

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-001",
    "name": "Duplicate SKU",
    "unitPrice": 10000.00,
    "quantityInStock": 10,
    "supplierId": 1
  }'
```

**Expected: 400 Bad Request - SKU already exists**

### Test Delete Supplier with Products

```bash
curl -X DELETE http://localhost:3000/api/suppliers/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Expected: 400 Bad Request - Cannot delete supplier with products**

### Test Permission Denied (Staff creating product)

```bash
# First login as staff
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff1",
    "password": "staff123"
  }'

# Try to create product (staff cannot)
export STAFF_TOKEN="staff_token_here"

curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer $STAFF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-TEST",
    "name": "Test",
    "unitPrice": 10000.00,
    "quantityInStock": 10,
    "supplierId": 1
  }'
```

**Expected: 403 Forbidden - Insufficient permissions**

---

## Complete Test Workflow

### 1. Login and Get Token
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo $TOKEN
```

### 2. View Products
```bash
curl -X GET http://localhost:3000/api/products?limit=5 \
  -H "Authorization: Bearer $TOKEN" | json_pp
```

### 3. Create Stock Movement
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "stock_in",
    "userId": 1,
    "notes": "Restock",
    "items": [{"productId": 1, "quantity": 50, "unitPrice": 25000}]
  }' | json_pp
```

### 4. Create Sale
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "userId": 1,
    "notes": "Customer purchase",
    "items": [{"productId": 1, "quantity": 5, "unitPrice": 28000}]
  }' | json_pp
```

### 5. Generate Reports
```bash
curl -X GET http://localhost:3000/api/reports/stock \
  -H "Authorization: Bearer $TOKEN" | json_pp
```

---

## Response Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK - Request succeeded | GET /products |
| 201 | Created - Resource created | POST /products |
| 400 | Bad Request - Validation error | Invalid input data |
| 401 | Unauthorized - No/Invalid token | Missing auth token |
| 403 | Forbidden - Permission denied | Staff trying to delete |
| 404 | Not Found - Resource doesn't exist | GET /products/999 |
| 500 | Server Error | Database connection error |

---

## Tips for Testing

1. **Pretty Print JSON**: Add `| json_pp` or `| jq .` (if installed)
2. **Save Token**: `export TOKEN="token_value"` to reuse
3. **Batch Testing**: Create a shell script with all tests
4. **Monitor Logs**: Keep `tail -f logs/combined.log` open
5. **Check Database**: Verify with `SELECT * FROM Products;`

---

## Tools for Better Testing

### Using Postman
1. Import the API endpoints manually
2. Set `Authorization` type to Bearer Token
3. Add token in Auth tab
4. Save requests for reuse

### Using Insomnia
1. Create collection
2. Set base URL: `http://localhost:3000`
3. Create requests with Bearer auth
4. Test environments for different tokens

### Using VS Code REST Client
Create `.rest` file:
```rest
@baseUrl = http://localhost:3000
@token = your_jwt_token

### Get Products
GET {{baseUrl}}/api/products
Authorization: Bearer {{token}}

### Create Product
POST {{baseUrl}}/api/products
Authorization: Bearer {{token}}
Content-Type: application/json

{...}
```

---

## Troubleshooting Tests

**"Connection refused"** - Server not running
```bash
npm run dev
```

**"Invalid token"** - Token expired, get new one
```bash
curl -X POST http://localhost:3000/api/auth/login ...
```

**"Not found"** - Wrong endpoint or ID
```bash
curl http://localhost:3000/api/products/999  # Check logs for actual IDs
```

**"Insufficient permissions"** - Use admin account
```bash
Login with admin/admin123
```