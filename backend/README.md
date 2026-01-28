# Homly E-commerce Backend

A comprehensive Node.js and MongoDB backend API for the Homly e-commerce application.

## Features

- RESTful API architecture
- MongoDB database with Mongoose ODM
- User authentication with JWT
- Complete CRUD operations for:
  - Products
  - Users
  - Orders
  - Stores
  - News
- Error handling middleware
- Request validation
- CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/homly-ecommerce
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Products
- `GET /api/products` - Get all products (supports query params: category, search, featured)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users/Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (Auth required)
- `PUT /api/users/profile` - Update user profile (Auth required)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all user orders (Auth required)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order status (Admin)
- `DELETE /api/orders/:id` - Delete order

### Stores
- `GET /api/stores` - Get all stores (supports query params: type, city)
- `GET /api/stores/:id` - Get single store
- `POST /api/stores` - Create new store (Admin)
- `PUT /api/stores/:id` - Update store (Admin)
- `DELETE /api/stores/:id` - Delete store (Admin)

### News
- `GET /api/news` - Get all news (supports query params: category, featured)
- `GET /api/news/:id` - Get single news article
- `POST /api/news` - Create new news (Admin)
- `PUT /api/news/:id` - Update news (Admin)
- `DELETE /api/news/:id` - Delete news (Admin)

## Database Models

### Product
- title, description, price, category, image, images[], stock, unit, featured

### User
- name, email, password (hashed), role, mobile, address

### Order
- user, items[], shippingAddress, paymentMethod, subtotal, shipping, tax, discount, total, status

### Store
- name, type, address, city, timing, mobile, image, rating, isActive

### News
- title, content, image, category, author, featured, views

## Testing the API

You can test the API using:
- **Postman**: Import the endpoints and test
- **Thunder Client** (VS Code extension)
- **cURL** commands
- **Frontend application**

Example cURL request:
```bash
curl http://localhost:5000/api/products
```

## MongoDB Setup

### Local MongoDB:
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/homly-ecommerce`

### MongoDB Atlas (Cloud):
1. Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env` file

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── models/
│   │   ├── Product.js
│   │   ├── User.js
│   │   ├── Order.js
│   │   ├── Store.js
│   │   └── News.js
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── userController.js
│   │   ├── orderController.js
│   │   ├── storeController.js
│   │   └── newsController.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── users.js
│   │   ├── orders.js
│   │   ├── stores.js
│   │   └── news.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── validation.js
│   └── server.js                # Main server file
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment mode | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/homly-ecommerce |
| JWT_SECRET | Secret key for JWT | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |

## Error Handling

The API uses a centralized error handling middleware that returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "stack": "Error stack (only in development)"
}
```

## Security Features

- Password hashing with bcryptjs
- JWT authentication
- CORS configuration
- Input validation
- MongoDB injection protection

## Future Enhancements

- File upload for images (Multer)
- Payment gateway integration
- Email notifications
- Rate limiting
- API documentation with Swagger
- Unit and integration tests

## License

ISC

## Support

For issues and questions, please create an issue in the repository.
