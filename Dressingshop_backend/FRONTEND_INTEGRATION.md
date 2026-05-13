# Frontend-Backend Integration Guide

This guide shows how to connect your React frontend to the Node.js backend.

## Step 1: Install Required Packages

```bash
npm install axios
```

## Step 2: Create API Configuration

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, clear and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
```

## Step 3: Create .env File

Create `.env` in your frontend root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Step 4: Update Context Providers

### Update CartContext to Use Backend (Optional)

If you want to persist cart to backend, create `src/services/cartService.js`:

```javascript
import API from './api';

export const cartService = {
  async createOrder(orderData) {
    const response = await API.post('/orders', orderData);
    return response.data;
  },

  async getOrders() {
    const response = await API.get('/orders/user/orders');
    return response.data;
  },

  async getOrderById(orderId) {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  },
};
```

### Authentication Service

Create `src/services/authService.js`:

```javascript
import API from './api';

export const authService = {
  async register(userData) {
    const response = await API.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async login(email, password) {
    const response = await API.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  async getProfile() {
    const response = await API.get('/auth/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await API.put('/auth/profile', profileData);
    return response.data;
  },

  logout() {
    localStorage.removeItem('authToken');
  },
};
```

### Product Service

Create `src/services/productService.js`:

```javascript
import API from './api';

export const productService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();

    if (filters.category) params.append('category', filters.category);
    if (filters.occasion) params.append('occasion', filters.occasion);
    if (filters.color) params.append('color', filters.color);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);

    const response = await API.get(`/products?${params}`);
    return response.data;
  },

  async getById(id) {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },
};
```

### User Service

Create `src/services/userService.js`:

```javascript
import API from './api';

export const userService = {
  // Addresses
  async addAddress(addressData) {
    const response = await API.post('/users/addresses', addressData);
    return response.data;
  },

  async getAddresses() {
    const response = await API.get('/users/addresses');
    return response.data;
  },

  async updateAddress(addressId, addressData) {
    const response = await API.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  },

  async deleteAddress(addressId) {
    const response = await API.delete(`/users/addresses/${addressId}`);
    return response.data;
  },

  // Wishlist
  async addToWishlist(productId) {
    const response = await API.post('/users/wishlist', { productId });
    return response.data;
  },

  async getWishlist() {
    const response = await API.get('/users/wishlist');
    return response.data;
  },

  async removeFromWishlist(productId) {
    const response = await API.delete('/users/wishlist', {
      data: { productId },
    });
    return response.data;
  },

  // Preferences
  async updatePreferences(preferences) {
    const response = await API.put('/users/preferences', preferences);
    return response.data;
  },
};
```

## Step 5: Update Pages

### Update Products.tsx

```typescript
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ sort: 'popularity' });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAll(filters);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  if (loading) return <div>Loading...</div>;

  return (
    // Your JSX using products state
  );
};

export default Products;
```

### Update ProductDetail.tsx

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '@/services/productService';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(id);
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
    // Your JSX using product state
  );
};

export default ProductDetail;
```

### Update Checkout.tsx

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartService } from '@/services/cartService';
import { useCart } from '@/context/CartContext';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const orderData = {
        items: items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        })),
        address,
        paymentMethod,
      };

      const response = await cartService.createOrder(orderData);
      clearCart();
      navigate('/order-success', { state: { order: response.order } });
    } catch (error) {
      console.error('Failed to place order:', error);
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your JSX with form
  );
};

export default Checkout;
```

### Update OrderHistory.tsx

```typescript
import { useEffect, useState } from 'react';
import { cartService } from '@/services/cartService';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await cartService.getOrders();
        setOrders(data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    // Your JSX using orders state
  );
};

export default OrderHistory;
```

### Update Profile.tsx

```typescript
import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, addressesData, wishlistData] = await Promise.all([
          authService.getProfile(),
          userService.getAddresses(),
          userService.getWishlist(),
        ]);

        setProfile(profileData.user);
        setAddresses(addressesData.addresses || []);
        setWishlist(wishlistData.wishlist || []);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    // Your JSX using profile, addresses, wishlist states
  );
};

export default Profile;
```

## Step 6: Create Login/Register Pages

Create a login page at `src/pages/Login.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authService.login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default Login;
```

## Step 7: Add Routes

Update your `App.tsx`:

```typescript
import Login from './pages/Login';
import Register from './pages/Register';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/register" element={<Layout><Register /></Layout>} />
      {/* ... other routes */}
    </Routes>
  </BrowserRouter>
);
```

## Step 8: Update .env

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Testing the Integration

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

4. Register a new account

5. Try adding products to cart and placing an order

## Troubleshooting

### CORS Errors
- Make sure backend is running on port 5000
- Check `.env` `CORS_ORIGIN` matches frontend URL
- Verify headers in API service

### Token Not Working
- Check token is saved in localStorage
- Verify JWT_SECRET in backend .env
- Check token format: `Bearer <token>`

### Products Not Loading
- Verify MongoDB is running
- Run `node seed-products.js` in backend to populate products
- Check browser console for specific error

## API Response Format

All API endpoints follow this format:

**Success Response:**
```json
{
  "message": "Success message",
  "data": { /* actual data */ }
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Next Steps

1. Update Navbar to show login/logout based on token
2. Add protected routes for authenticated users only
3. Implement wishlist integration
4. Add address management UI
5. Implement payment gateway integration
6. Add order tracking updates

For more details, see the backend README.md
