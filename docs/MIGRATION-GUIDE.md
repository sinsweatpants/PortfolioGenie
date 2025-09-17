# Migration Guide: From Replit Auth to JWT Authentication

This guide explains the changes made to migrate PortfolioGenie from Replit-specific authentication to standard JWT authentication.

## Overview

The application has been migrated from Replit's OpenID Connect authentication to a standard JWT-based authentication system. This makes the application platform-independent and easier to deploy on any hosting service.

## Key Changes

### 1. Authentication System

**Before (Replit Auth):**
- Used OpenID Connect with Replit
- Session-based authentication
- Required Replit-specific environment variables
- Automatic user creation from Replit profile

**After (JWT Auth):**
- JWT token-based authentication
- User registration and login endpoints
- Password-based authentication
- Self-contained user management

### 2. Database Schema Changes

**Added to `users` table:**
- `password` - Hashed user password (required)
- `is_email_verified` - Email verification status
- `reset_password_token` - For password reset functionality
- `reset_password_expires` - Token expiration timestamp

**Modified:**
- `email` field is now required (NOT NULL)

**Removed:**
- `sessions` table (no longer needed with JWT)

### 3. API Endpoints Changes

**New Authentication Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout (client-side token removal)

**Modified Endpoints:**
- All protected endpoints now require `Authorization: Bearer <token>` header
- User context is now available via `req.user` instead of `req.user.claims.sub`

**Removed Endpoints:**
- `/api/login` (Replit login redirect)
- `/api/callback` (Replit OAuth callback)
- `/api/logout` (Replit logout redirect)

### 4. Environment Variables

**New Required Variables:**
- `JWT_SECRET` - Secret key for JWT signing (required)
- `JWT_EXPIRES_IN` - Token expiration time (optional, default: 7d)

**Removed Variables:**
- `REPLIT_DOMAINS` - No longer needed
- `ISSUER_URL` - No longer needed
- `REPL_ID` - No longer needed
- `SESSION_SECRET` - No longer needed (JWT tokens replace sessions)

### 5. Dependencies Changes

**Added:**
- `jsonwebtoken` - JWT token handling
- `bcryptjs` - Password hashing
- `@types/jsonwebtoken` - TypeScript types
- `@types/bcryptjs` - TypeScript types

**Removed:**
- `openid-client` - Replit OpenID Connect client
- `passport` - Authentication middleware
- `passport-local` - Local authentication strategy
- `connect-pg-simple` - PostgreSQL session store
- All Replit-specific packages

## Migration Steps

### 1. Update Environment Variables

Create a new `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:
```env
# Replace with a strong secret key
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Optional: Customize token expiration
JWT_EXPIRES_IN=7d

# Remove these old variables:
# REPLIT_DOMAINS=
# ISSUER_URL=
# REPL_ID=
# SESSION_SECRET=
```

### 2. Database Migration

Run the database migration to add authentication fields:

```sql
-- Add password and authentication fields
ALTER TABLE users 
ADD COLUMN password varchar NOT NULL DEFAULT '';

ALTER TABLE users 
ADD COLUMN is_email_verified boolean DEFAULT false;

ALTER TABLE users 
ADD COLUMN reset_password_token varchar;

ALTER TABLE users 
ADD COLUMN reset_password_expires timestamp;

-- Make email required
ALTER TABLE users 
ALTER COLUMN email SET NOT NULL;

-- Drop sessions table
DROP TABLE IF EXISTS sessions;
```

### 3. Update Dependencies

Install new dependencies:

```bash
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

Remove old dependencies:

```bash
npm uninstall openid-client passport passport-local connect-pg-simple
```

### 4. Frontend Changes

Update your frontend authentication flow:

**Before (Replit Auth):**
```javascript
// Redirect to Replit login
window.location.href = '/api/login'

// Check authentication via session
fetch('/api/auth/user')
```

**After (JWT Auth):**
```javascript
// Login with credentials
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})

const { token } = await response.json()
localStorage.setItem('token', token)

// Use token in subsequent requests
fetch('/api/portfolios', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 5. User Data Migration

If you have existing users, you'll need to:

1. **Contact existing users** to set up passwords
2. **Implement a password reset flow** for account recovery
3. **Consider implementing email verification** for security

## New Features Available

With the JWT authentication system, you can now implement:

1. **Password Reset**: Email-based password recovery
2. **Email Verification**: Verify user email addresses
3. **Account Management**: User profile updates
4. **Multi-factor Authentication**: Add 2FA in the future
5. **API Key Authentication**: For third-party integrations

## Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret key
2. **Password Hashing**: Passwords are hashed with bcrypt (salt rounds: 12)
3. **Token Expiration**: Tokens expire after 7 days by default
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: All inputs are validated with Zod schemas

## Testing the Migration

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Test registration**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
   ```

3. **Test login**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

4. **Test protected endpoints**:
   ```bash
   curl -X GET http://localhost:5000/api/portfolios \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Troubleshooting

### Common Issues

1. **"JWT Secret not provided"**
   - Ensure `JWT_SECRET` is set in your `.env` file

2. **"Cannot find module 'jsonwebtoken'"**
   - Run `npm install` to install new dependencies

3. **Database errors**
   - Run the database migration SQL commands
   - Ensure your database connection is working

4. **Frontend authentication errors**
   - Update frontend code to use new authentication endpoints
   - Remove old session-based authentication code

### Support

If you encounter issues during migration:

1. Check the console logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure database migration completed successfully
4. Review the new API documentation in `docs/API-v2.md`

## Rollback Plan

If you need to rollback to Replit Auth:

1. Restore the original `replitAuth.ts` file
2. Reinstall Replit-specific dependencies
3. Restore original environment variables
4. Revert database schema changes
5. Update frontend to use session-based authentication

However, this should only be done in emergency situations as the new JWT system provides better security and platform independence.