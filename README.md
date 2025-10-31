# Toko Retail - Inventory Management System API

A production-ready backend API for managing retail inventory, built with Node.js, Express, MySQL, and Sequelize ORM.

## Features

✅ **User Authentication** - JWT-based auth with 24-hour tokens
✅ **Role-Based Access** - Admin and Staff roles with different permissions
✅ **Product Management** - Full CRUD with SKU tracking and stock alerts
✅ **Supplier Management** - Track suppliers and their associated products
✅ **Transaction Management** - Record sales, stock movements, and returns with atomic operations
✅ **Stock Management** - Automatic stock updates with validation and reorder thresholds
✅ **Reporting** - Stock reports, sales analytics, and dashboard statistics
✅ **Security** - Helmet, CORS, rate limiting, JWT validation
✅ **Database Migrations** - Sequelize migrations and seeders for easy setup
✅ **Error Handling** - Comprehensive error handling and logging with Winston

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env from template
cp .env.example .env

# 3. Configure your database in .env

# 4. Create MySQL database
mysql -u root -p
CREATE DATABASE toko_retail;

# 5. Run migrations and seeders
npm run db:reset

# 6. Start development server
npm run dev

# Server running at http://localhost:3000
```

## Default Credentials

After running seeders:

| User   | Username | Password  | Role  |
|--------|----------|-----------|-------|
| Admin  | admin    | admin123  | admin |
| Staff1 | staff1   | staff123  | staff |
| Staff2 | staff2   | staff123  | staff |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Products (Admin CRUD, Staff View)
- `GET /api/products` - List products with pagination
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Suppliers (Admin CRUD, Staff View)
- `GET /api/suppliers` - List suppliers
- `GET /api/suppliers/:id` - Get supplier details
- `POST /api/suppliers` - Create supplier (admin)
- `PUT /api/suppliers/:id` - Update supplier (admin)
- `DELETE /api/suppliers/:id` - Delete supplier (admin)

### Transactions (All Users Create, Admin Delete)
- `GET /api/transactions` - List transactions with filtering
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions/:id` - Delete transaction & reverse stock (admin)

### Reports
- `GET /api/reports/stock` - Stock status and alerts
- `GET /api/reports/sales` - Sales analytics
- `GET /api/reports/dashboard/stats` - Dashboard statistics

## Tech Stack

- **Runtime**: Node.js v14+
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (24-hour expiry)
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Password Hashing**: bcryptjs

## Project Structure

```
src/
├── config/           # Database and environment config
├── models/           # Sequelize models (User, Product, Supplier, Transaction, TransactionItem)
├── controllers/      # Business logic (auth, product, supplier, transaction, report)
├── routes/           # API endpoints
├── middleware/       # Auth, validation, error handling
├── utils/            # Helpers, logger, validation schemas
├── migrations/       # Database migrations
└── seeders/          # Sample data

app.js               # Express app setup
server.js            # Server entry point
.env.example         # Environment template
.gitignore          # Git ignore patterns
.sequelizerc         # Sequelize CLI config
```

## Installation Details

### Prerequisites
- Node.js v14 or higher
- MySQL v5.7 or higher
- npm v6 or higher

### Setup Steps

1. **Clone Repository**
   ```bash
   cd Toko_Retail
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=toko_retail
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your_secret_key_here
   ```

4. **Create Database**
   ```bash
   mysql -u root -p
   CREATE DATABASE toko_retail CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

5. **Run Database Setup**
   ```bash
   # Run migrations and seeders (recommended)
   npm run db:reset

   # OR run separately:
   npm run migrate     # Create tables
   npm run seed        # Insert sample data
   ```

6. **Start Server**
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm start
   ```

## API Usage Examples

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "password123",
    "role": "staff"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 3. Get Products (with token)
```bash
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-100",
    "name": "Minyak Goreng 2L",
    "unitPrice": 28000.00,
    "quantityInStock": 50,
    "reorderThreshold": 20,
    "supplierId": 1
  }'
```

### 5. Create Transaction (Sale)
```bash
curl -X POST http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionType": "sale",
    "userId": 1,
    "notes": "Morning sales",
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

## Database Schema

### User Table
- id (PK)
- username (unique)
- password (hashed)
- role (enum: admin, staff)
- timestamps

### Supplier Table
- id (PK)
- name
- contact
- address
- timestamps

### Product Table
- id (PK)
- sku (unique)
- name
- description
- unitPrice (DECIMAL 10,2)
- quantityInStock
- reorderThreshold
- supplierId (FK)
- createdBy, updatedBy (FK to User)
- timestamps

### Transaction Table (Header)
- id (PK)
- invoiceNumber (unique)
- transactionType (enum: sale, stock_in, stock_out, return)
- totalAmount (DECIMAL 10,2)
- userId (FK)
- notes
- timestamps

### TransactionItem Table (Detail)
- id (PK)
- transactionId (FK, cascade delete)
- productId (FK)
- quantity
- unitPrice (DECIMAL 10,2)
- lineTotal (DECIMAL 10,2)
- timestamps

## Key Features Explained

### Transaction with Stock Management
- Atomic operations: All-or-nothing transaction creation
- Stock validation: Prevents overselling
- Auto-adjustments: Stock decreases on sales, increases on stock_in
- Rollback support: Deleting transaction reverses stock changes

### Stock Alerts
- Automatic low-stock detection
- Reorder threshold configuration per product
- Included in product responses and reports

### Role-Based Access
- **Admin**: Full CRUD on products, suppliers; can delete transactions
- **Staff**: Can view products/suppliers; can create/view transactions

### Security
- JWT tokens with 24-hour expiry
- bcryptjs password hashing
- CORS and Helmet headers
- Rate limiting (100 requests/15 min)
- Input validation on all endpoints

## Logging

Logs are stored in `/logs` directory:
- `error.log` - Error level logs
- `combined.log` - All logs

Console output in development mode for debugging.

## Troubleshooting

### Connection Refused
```
Error: connect ECONNREFUSED

Solution: Ensure MySQL is running
```

### Invalid Token
```
Error: Invalid or expired token

Solution: Get a new token by logging in
```

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::3000

Solution: Change PORT in .env or kill the process using that port
```

### Database Sync Issues
```
Error: Table doesn't exist

Solution: Run migrations: npm run migrate
```

## Performance Considerations

1. Use pagination on list endpoints: `?page=1&limit=50`
2. Transactions are wrapped in database transactions for consistency
3. Indexes on frequently queried fields (SKU, email, dates)
4. Connection pooling via Sequelize

## Production Deployment

1. Set `NODE_ENV=production` in .env
2. Update JWT_SECRET with a strong key
3. Configure proper DATABASE_URL
4. Use HTTPS
5. Set appropriate CORS_ORIGIN
6. Monitor logs directory
7. Enable rate limiting adjustments
8. Regular database backups

## Scripts

```bash
npm start              # Run production server
npm run dev            # Run development server with hot reload
npm run migrate        # Run database migrations
npm run migrate:undo   # Rollback migrations
npm run seed           # Run seeders
npm run seed:undo      # Rollback seeders
npm run db:reset       # Reset database (migrate + seed)
```

## Support & Issues

For detailed API documentation and troubleshooting, refer to the inline code comments and Winston logs.

## License

MIT License