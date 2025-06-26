# Pay Parking Backend API

This is the backend API for the Pay Parking application, providing endpoints for authentication, ticket management, OTP verification, and payment processing.

## Features

- **Authentication**: User signup, login, profile management
- **Ticket Management**: Create, view, update, and delete parking tickets
- **OTP Verification**: Generate and verify OTPs for ticket dispatching
- **Payment Processing**: Calculate fees and process payments

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Twilio for SMS (OTP)
- Express Validator for input validation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd pay-parking/Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit the `.env` file with your actual configuration values.

### Running the Server

Development mode with auto-restart:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)

### Tickets

- `POST /api/tickets` - Create a new parking ticket
- `GET /api/tickets` - Get all tickets (with pagination)
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id` - Update ticket (requires auth)
- `DELETE /api/tickets/:id` - Delete ticket (requires auth)
- `GET /api/tickets/vehicle/:vehicleNo` - Find ticket by vehicle number

### OTP

- `POST /api/otp/request` - Request an OTP (for ticket dispatch)
- `POST /api/otp/verify` - Verify an OTP
- `POST /api/otp/resend` - Resend an OTP

### Payment

- `GET /api/payment/calculate/:ticketId` - Calculate parking fee
- `POST /api/payment/process` - Process payment
- `GET /api/payment/receipt/:ticketId` - Get payment receipt
- `GET /api/payment/status/:ticketId` - Check payment status

## Database Schema

### User

- `name`: String
- `email`: String (unique)
- `password`: String (hashed)
- `role`: String (enum: ["user", "admin"])
- `mobileNo`: String
- timestamps

### Ticket

- `ticketId`: String (generated)
- `customerName`: String
- `vehicleNo`: String
- `mobileNo`: String
- `inDateTime`: Date
- `outDateTime`: Date
- `status`: String (enum: ["active", "completed", "cancelled"])
- `otp`: String
- `otpExpiry`: Date
- `otpVerified`: Boolean
- `payment`: Object (status, amount, transactionId, paymentMethod, processedAt)
- `parkingLocation`: String
- timestamps

## Error Handling

The API uses a centralized error handling middleware that returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...] // For validation errors
}
```

## Integration with Frontend

To connect this backend with the React frontend:

1. Make sure both servers are running
2. Set CORS to allow requests from your frontend origin
3. Use the API endpoints from your frontend components

## License

MIT
