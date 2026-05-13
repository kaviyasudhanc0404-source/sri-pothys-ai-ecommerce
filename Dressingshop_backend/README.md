# Dressing Shop Backend

A fully functional Node.js/Express.js backend for the Dressing Shop e-commerce platform with MongoDB integration.

## Features

✅ User Authentication (Register, Login, JWT)
✅ Product Management (Admin CRUD operations)
✅ Order Management (Create, Track, Admin Management)
✅ User Profiles (Save addresses, preferences)
✅ Wishlist Management
✅ Role-based Access Control (Admin/User)
✅ Error Handling & Validation
✅ CORS Support for Frontend Integration

## Project Structure

```
backend/
├── config/
│   └── database.js           # MongoDB connection
├── controllers/
│   ├── authController.js     # Auth logic (register, login, profile)
│   ├── productController.js  # Product CRUD operations
│   ├── orderController.js    # Order management
│   └── userController.js     # User addresses, wishlist, preferences
├── middleware/
│   └── auth.js              # JWT authentication & authorization
├── models/
│   ├── User.js              # User schema
│   ├── Product.js           # Product schema
│   └── Order.js             # Order schema
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── productRoutes.js     # Product endpoints
│   ├── orderRoutes.js       # Order endpoints
│   └── userRoutes.js        # User endpoints
├── utils/
│   └── helpers.js           # JWT generation, validation helpers
├── .env                     # Environment variables
├── package.json            # Dependencies
└── server.js               # Main server file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud like MongoDB Atlas)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Edit `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dressingshop
MONGODB_URI_FALLBACK=mongodb://127.0.0.1:27017/dressingshop
JWT_SECRET=replace-with-your-own-local-development-secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-me-in-your-local-env
ADMIN_FIRST_NAME=Sudhan
ADMIN_LAST_NAME=Admin
ADMIN_PHONE=+91 99999 99999
```

**For MongoDB Atlas:**
```env
MONGODB_URI=<your-mongodb-atlas-connection-string>
```

If you get an error like `queryTxt EREFUSED` (Atlas SRV DNS lookup blocked by your DNS/network), either:
- Use a local MongoDB URI: `MONGODB_URI=mongodb://127.0.0.1:27017/dressingshop`, or
- Use an Atlas standard connection string instead of an SRV connection string.

Optional fallback (used when the primary URI fails):
```env
MONGODB_URI_FALLBACK=mongodb://127.0.0.1:27017/dressingshop
```

### Step 3: Start the Backend

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

### Step 4: Seed Products (Optional)

Run the `seed-products.js` script to populate the database with sample products:

```bash
node seed-products.js
```

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Priya",
  "lastName": "Sharma",
  "email": "priya@example.com",
  "password": "password123",
  "phone": "+91 98765 43210"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65f1a2b3c4d5e6f7g8h9i0j",
    "firstName": "Priya",
    "lastName": "Sharma",
    "email": "priya@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "priya@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Priya",
  "lastName": "Sharma",
  "phone": "+91 98765 43210",
  "dateOfBirth": "1995-03-15",
  "gender": "Female"
}
```

### Products

#### Get All Products
```http
GET /api/products
GET /api/products?category=Sarees
GET /api/products?occasion=Wedding
GET /api/products?minPrice=1000&maxPrice=20000
GET /api/products?search=silk
GET /api/products?sort=price-low
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Kanchipuram Silk Saree - Royal Blue",
  "price": 12999,
  "originalPrice": 18999,
  "image": "https://example.com/image.jpg",
  "category": "Sarees",
  "occasion": "Wedding",
  "color": "Blue",
  "size": ["Free Size"],
  "rating": 4.8,
  "reviews": 324,
  "description": "Exquisite Kanchipuram silk saree...",
  "badge": "Bestseller",
  "isNew": false
}
```

#### Update Product (Admin Only)
```http
PUT /api/products/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "price": 11999,
  "stock": 50
}
```

#### Delete Product (Admin Only)
```http
DELETE /api/products/:id
Authorization: Bearer <admin-token>
```

### Orders

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "65f1a2b3c4d5e6f7g8h9i0j",
      "quantity": 1,
      "selectedSize": "Free Size"
    }
  ],
  "address": {
    "name": "Home",
    "phone": "+91 98765 43210",
    "address": "123 Silk Street",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600017"
  },
  "paymentMethod": "upi"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "orderId": "ORD-1699123456-123",
    "userId": "65f1a2b3c4d5e6f7g8h9i0j",
    "items": [...],
    "address": {...},
    "paymentMethod": "upi",
    "subtotal": 12999,
    "shipping": 0,
    "total": 12999,
    "orderStatus": "Ordered",
    "paymentStatus": "pending"
  }
}
```

#### Get User Orders
```http
GET /api/orders/user/orders
Authorization: Bearer <token>
```

#### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Update Order Status (Admin Only)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "status": "Processing"
}
```

Valid statuses: `Ordered`, `Processing`, `Shipped`, `Delivered`, `Cancelled`

#### Get All Orders (Admin Only)
```http
GET /api/orders
Authorization: Bearer <admin-token>
```

### User Management

#### Add Address
```http
POST /api/users/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Home",
  "address": "123 Silk Street",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600017",
  "phone": "+91 98765 43210",
  "isDefault": true
}
```

#### Get Addresses
```http
GET /api/users/addresses
Authorization: Bearer <token>
```

#### Update Address
```http
PUT /api/users/addresses/:addressId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Home",
  "address": "456 MG Road",
  "city": "Chennai",
  "state": "Tamil Nadu",
  "pincode": "600034",
  "phone": "+91 98765 43211",
  "isDefault": true
}
```

#### Delete Address
```http
DELETE /api/users/addresses/:addressId
Authorization: Bearer <token>
```

#### Add to Wishlist
```http
POST /api/users/wishlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "65f1a2b3c4d5e6f7g8h9i0j"
}
```

#### Get Wishlist
```http
GET /api/users/wishlist
Authorization: Bearer <token>
```

#### Remove from Wishlist
```http
DELETE /api/users/wishlist
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "65f1a2b3c4d5e6f7g8h9i0j"
}
```

#### Update Preferences
```http
PUT /api/users/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailNotifications": true,
  "smsNotifications": false,
  "pushNotifications": true
}
```

## Frontend Integration

### Update Frontend .env

Create a `.env` file in your frontend directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Create API Service

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

### Update Components to Use Backend

Example: Update `ProductDetail.tsx` to fetch from backend:

```javascript
import { useEffect, useState } from 'react';
import API from '@/services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data.product);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    // Your component JSX
  );
};
```

## Testing with Postman

1. Import the API endpoints into Postman
2. Register a new user
3. Copy the token from the response
4. Add Authorization header: `Bearer <token>`
5. Test other endpoints

## MongoDB Setup

### Local MongoDB

```bash
# On Windows (using WSL2)
mongod --dbpath /path/to/data

# On Mac
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### MongoDB Atlas (Cloud)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` with your MongoDB Atlas connection string.

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in `.env` matches your frontend URL
- If running frontend on different port, update `.env`

### MongoDB Connection Issues
- Check MongoDB is running: `mongosh` (local)
- Verify connection string in `.env`
- Check MongoDB credentials for Atlas

### JWT Token Errors
- Ensure token is sent in `Authorization: Bearer <token>` header
- Check token hasn't expired (7 days validity)
- Verify `JWT_SECRET` is consistent

## Default Admin Account

To create an admin account, first register a user, then run:

```bash
# In MongoDB directly
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or update via controller before saving.

## Future Enhancements

- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Email notifications
- [ ] Image upload functionality
- [ ] Real AI recommendations (using ML model)
- [ ] Advanced analytics
- [ ] Inventory management
- [ ] Review & rating system
- [ ] Return/Refund management

## License

ISC
