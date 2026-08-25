# JWT Auth MVC

A learning project: JWT authentication in Node/Express, built with MVC structure,
role-based access control, and refresh tokens.

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
├── server.js                 # App entry point
├── .env.example
└── package.json
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in real values:
   ```
   cp .env.example .env
   ```
   Generate strong secrets, e.g.:
   ```
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   Run it twice — once for `ACCESS_TOKEN_SECRET`, once for `REFRESH_TOKEN_SECRET`.

3. Make sure MongoDB is running locally, or point `MONGO_URI` at a hosted instance
   (e.g. MongoDB Atlas).

4. Start the server:
   ```
   npm run dev
   ```

## How the auth flow works

- **Register** — creates a user, password is hashed with bcrypt before saving.
- **Login** — verifies credentials, issues an **access token** (short-lived, e.g. 15min)
  and a **refresh token** (long-lived, e.g. 7 days). The refresh token is set as an
  httpOnly cookie and also saved in the `RefreshToken` collection so it can be revoked.
- **Protected routes** — client sends the access token as
  `Authorization: Bearer <token>`. `authMiddleware` verifies it and attaches
  `req.user = { id, role }`.
- **Role-restricted routes** — `roleMiddleware` checks `req.user.role` after
  `authMiddleware` has run.
- **Refresh** — when the access token expires, the client calls `/api/auth/refresh`.
  The server reads the refresh token cookie, checks it's still valid in the DB
  (not revoked/logged out), and issues a new access token.
- **Logout** — deletes the stored refresh token and clears the cookie, so it can no
  longer be used to mint new access tokens.

## API Endpoints

| Method | Route                    | Auth required | Description                     |
|--------|---------------------------|----------------|----------------------------------|
| POST   | `/api/auth/register`      | No             | Create a new user                |
| POST   | `/api/auth/login`         | No             | Log in, get access + refresh token |
| POST   | `/api/auth/refresh`       | Refresh cookie | Get a new access token           |
| POST   | `/api/auth/logout`        | Refresh cookie | Revoke refresh token             |
| GET    | `/api/auth/me`            | Access token   | Get current user profile         |
| GET    | `/api/auth/admin-only`    | Access token + admin role | Example admin-only route |

## Testing with curl

Register:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

Login (save the cookie so refresh/logout work):
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"alice@example.com","password":"secret123"}'
```

Access a protected route (replace `<ACCESS_TOKEN>` with the token from login):
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Refresh:
```bash
curl -X POST http://localhost:5000/api/auth/refresh -b cookies.txt
```

Logout:
```bash
curl -X POST http://localhost:5000/api/auth/logout -b cookies.txt
```

To test the admin route, manually set a user's `role` to `"admin"` in MongoDB
(e.g. via `mongosh` or MongoDB Compass), log in again to get a token with that role
baked in, then call `/api/auth/admin-only`.

## Notes / things to explore next

- `RefreshToken.expiresAt` uses a MongoDB TTL index, so expired tokens are
  automatically cleaned up.
- The refresh cookie's `maxAge` is hardcoded to 7 days in `authController.js` —
  keep it in sync with `REFRESH_TOKEN_EXPIRY` in `.env`, or use the `ms` package
  to parse it dynamically.
- For multi-device logout support, you could add a `logout-all` endpoint that
  deletes all `RefreshToken` docs for a given user.
- In production, always set `NODE_ENV=production` so cookies are marked `secure`
  (HTTPS only).
