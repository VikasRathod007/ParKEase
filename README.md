# Pay Parking Application

A full-stack parking management system with SMS OTP verification using Twilio.

## 🚀 Features

- **Parking Ticket Management**: Create and manage parking tickets
- **SMS OTP Verification**: Secure verification using Twilio SMS
- **Demo Mode**: Test functionality without sending real SMS
- **Real-time Updates**: Live ticket status updates
- **Mobile Responsive**: Works on all devices

## 🏗️ Project Structure

```
pay-parking/
├── Backend/          # Node.js + Express API
├── Frontend/         # React.js Application
├── README.md         # This file
└── .gitignore       # Git ignore rules
```

## 🛠️ Technologies Used

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Twilio** for SMS services
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React.js** with Context API
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Router** for navigation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Twilio Account (for SMS)
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd pay-parking
```

### 2. Setup Backend
```bash
cd Backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm start
```

### 3. Setup Frontend
```bash
cd Frontend
npm install
npm start
```

## ⚙️ Configuration

### Backend Environment Variables (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pay-parking
JWT_SECRET=your-secret-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
TWILIO_MOCK_MODE=true  # Set to false for real SMS
```

### Frontend Configuration
- Ensure backend URL is correctly set in `src/utils/api.js`
- Default: `http://localhost:5000`

## 🔧 Development

### Start Backend Server
```bash
cd Backend
npm start          # Production mode
npm run dev        # Development mode (auto-restart)
```

### Start Frontend Server
```bash
cd Frontend
npm start          # Development server
npm run build      # Production build
```

## 📱 SMS Modes

### Demo Mode (TWILIO_MOCK_MODE=true)
- OTPs are displayed on the frontend
- No real SMS sent
- Perfect for testing and demos

### Production Mode (TWILIO_MOCK_MODE=false)
- Real SMS sent via Twilio
- OTPs delivered to mobile numbers
- Requires valid Twilio credentials

## 🧪 Testing

### Test OTP Request
```bash
# Create a ticket
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test User","vehicleNo":"KA01AB1234","mobileNo":"+919876543210","parkingLocation":"Main Parking"}'

# Request OTP
curl -X POST http://localhost:5000/api/otp/request \
  -H "Content-Type: application/json" \
  -d '{"vehicleNo":"KA01AB1234"}'
```

## 📚 API Documentation

### Tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:vehicleNo` - Get ticket by vehicle number
- `PUT /api/tickets/:ticketId/checkout` - Checkout ticket

### OTP
- `POST /api/otp/request` - Request OTP for ticket
- `POST /api/otp/verify` - Verify OTP

### Health Check
- `GET /health` - Server health status

## 🔐 Security Features

- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Environment variable protection

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Ensure MongoDB connection string is updated
3. Set `NODE_ENV=production`
4. Configure Twilio for production

### Frontend Deployment
1. Update API base URL for production
2. Run `npm run build`
3. Deploy build folder to hosting service
4. Configure routing for SPA

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

## 🙏 Acknowledgments

- Twilio for SMS services
- MongoDB for database
- React.js and Node.js communities
