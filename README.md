# JWT Auth

JWT authentication in Node/Express.

## Project Structure

```
jwt-auth-mvc/
├── config/
│   └── db.js                # MongoDB connection
├── models/
│   ├── User.js               # User schema + password hashing
│   └── RefreshToken.js       # Stored refresh tokens (revocable)
├── controllers/
│   └── authController.js     # register, login, refresh, logout, getMe
├── middleware/
│   ├── authMiddleware.js     # Verifies access token
│   └── roleMiddleware.js     # Restricts routes by role
├── routes/
│   └── authRoutes.js
├── utils/
│   └── generateTokens.js     # Signs access + refresh JWTs
├── server.js                
├── .env.example
└── package.json
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

| Method | Route                    | Auth required | Description                     |
|--------|---------------------------|----------------|----------------------------------|
| POST   | `/api/auth/register`      | No             | Create a new user                |
| POST   | `/api/auth/login`         | No             | Log in, get access + refresh token |
| POST   | `/api/auth/refresh`       | Refresh cookie | Get a new access token           |
| POST   | `/api/auth/logout`        | Refresh cookie | Revoke refresh token             |
| GET    | `/api/auth/me`            | Access token   | Get current user profile         |
| GET    | `/api/auth/admin-only`    | Access token + admin role | Example admin-only route |
