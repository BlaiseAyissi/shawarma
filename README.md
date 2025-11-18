# 🥙 The House of Shawarma - Delivery App

A full-stack MERN (MongoDB, Express, React, Node.js) application for a shawarma delivery service with WhatsApp payment integration.

## ✨ Features

### Customer Features
- 🛒 Browse products by category
- 🔍 Search functionality
- 🛍️ Shopping cart with real-time updates
- 👤 User authentication (register/login)
- 📱 WhatsApp payment integration
- 📦 Order tracking
- 🌐 Multi-language support (French/English)
- 📱 Fully responsive design

### Admin Features
- 📊 Dashboard with statistics
- 📦 Order management with real-time notifications
- 🍔 Product management (CRUD)
- 🏷️ Category management
- 🧀 Topping management
- ⚙️ Settings configuration
- 📱 WhatsApp number configuration

## 🚀 Tech Stack

### Frontend
- React 18 with TypeScript
- React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Axios for API calls
- React Hot Toast for notifications
- i18next for internationalization

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Helmet for security
- CORS enabled

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd shawarma
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your backend URL
npm start
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/shawarma
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Deploy in 15 minutes
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Pre/post deployment checklist
- **[ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)** - Environment variables guide
- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Development workflow

## 🚀 Deployment

### Quick Deploy with Vercel

**Backend:**
```bash
cd backend
vercel --prod
```

**Frontend:**
```bash
cd frontend
vercel --prod
```

See [QUICK_START.md](./QUICK_START.md) for detailed deployment instructions.

## 🔐 Default Admin Credentials

- **Email:** admin@shawarma.com
- **Password:** admin123
- **⚠️ CHANGE IMMEDIATELY AFTER FIRST LOGIN**

## 📱 WhatsApp Integration

Orders are sent to WhatsApp for payment. Configure your WhatsApp number in Admin → Settings.

Format: `+1234567890` (include country code, no spaces)

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Build for Production

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
```

## 🐳 Docker Deployment

```bash
docker-compose up -d
```

Access:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## 📊 Project Structure

```
shawarma/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── scripts/
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Input validation
- XSS protection

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/admin/all` - Get all orders (admin)
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status (admin)

See full API documentation in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database
- All open-source contributors

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check documentation files
- Review troubleshooting guides

---

**Made with ❤️ for shawarma lovers everywhere! 🥙**
