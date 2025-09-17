# PortfolioGenie API Documentation

## Overview

PortfolioGenie API provides endpoints for user authentication, portfolio management, project handling, and template browsing. The API uses JWT (JSON Web Tokens) for authentication.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication

The API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Authentication Endpoints

#### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Login User

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Get Current User

```http
GET /auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Logout User

```http
POST /auth/logout
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

*Note: With JWT, logout is primarily handled on the client side by removing the token.*

---

## Portfolio Endpoints

All portfolio endpoints require authentication unless specified otherwise.

#### Get User Portfolios

```http
GET /portfolios
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "portfolio_id",
    "userId": "user_id",
    "name": "My Portfolio",
    "description": "A showcase of my work",
    "slug": "my-portfolio",
    "templateId": "template_1",
    "isPublished": true,
    "customization": {},
    "viewCount": 15,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
]
```

#### Get Portfolio by ID

```http
GET /portfolios/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "portfolio_id",
  "userId": "user_id",
  "name": "My Portfolio",
  "description": "A showcase of my work",
  "slug": "my-portfolio",
  "templateId": "template_1",
  "isPublished": true,
  "customization": {
    "theme": "dark",
    "primaryColor": "#3B82F6"
  },
  "viewCount": 15,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

#### Create Portfolio

```http
POST /portfolios
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My New Portfolio",
  "description": "A description of my portfolio",
  "slug": "my-new-portfolio",
  "templateId": "template_1",
  "isPublished": false,
  "customization": {
    "theme": "light",
    "primaryColor": "#10B981"
  }
}
```

**Response:**
```json
{
  "id": "new_portfolio_id",
  "userId": "user_id",
  "name": "My New Portfolio",
  "description": "A description of my portfolio",
  "slug": "my-new-portfolio",
  "templateId": "template_1",
  "isPublished": false,
  "customization": {
    "theme": "light",
    "primaryColor": "#10B981"
  },
  "viewCount": 0,
  "createdAt": "2024-01-03T00:00:00Z",
  "updatedAt": "2024-01-03T00:00:00Z"
}
```

#### Update Portfolio

```http
PATCH /portfolios/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Portfolio Name",
  "isPublished": true,
  "customization": {
    "theme": "dark",
    "primaryColor": "#EF4444"
  }
}
```

#### Delete Portfolio

```http
DELETE /portfolios/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Project Endpoints

#### Get Portfolio Projects

```http
GET /portfolios/:portfolioId/projects
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "project_id",
    "portfolioId": "portfolio_id",
    "title": "My Project",
    "description": "A description of my project",
    "imageUrl": "/uploads/project-image.jpg",
    "projectUrl": "https://github.com/user/project",
    "tags": ["React", "TypeScript", "Tailwind"],
    "order": 1,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Create Project

```http
POST /portfolios/:portfolioId/projects
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Project",
  "description": "Description of the new project",
  "imageUrl": "/uploads/new-project.jpg",
  "projectUrl": "https://github.com/user/new-project",
  "tags": ["Vue", "JavaScript"],
  "order": 2
}
```

#### Update Project

```http
PATCH /projects/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "tags": ["React", "TypeScript", "Node.js"]
}
```

#### Delete Project

```http
DELETE /projects/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

## Template Endpoints

#### Get All Templates

```http
GET /templates
```

**Query Parameters:**
- `category` (optional): Filter by template category

**Response:**
```json
[
  {
    "id": "template_1",
    "name": "Modern Portfolio",
    "description": "A clean, modern portfolio template",
    "category": "modern",
    "previewUrl": "/templates/modern/preview.jpg",
    "config": {
      "layout": "grid",
      "sections": ["hero", "about", "projects", "contact"]
    },
    "usageCount": 150,
    "rating": 5,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Get Template by ID

```http
GET /templates/:id
```

**Response:**
```json
{
  "id": "template_1",
  "name": "Modern Portfolio",
  "description": "A clean, modern portfolio template",
  "category": "modern",
  "previewUrl": "/templates/modern/preview.jpg",
  "config": {
    "layout": "grid",
    "sections": ["hero", "about", "projects", "contact"],
    "customization": {
      "allowThemeChange": true,
      "allowColorChange": true,
      "availableLayouts": ["grid", "masonry"]
    }
  },
  "usageCount": 150,
  "rating": 5,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## Public Endpoints

#### Get Public Portfolio

```http
GET /public/portfolios/:slug
```

**Response:**
```json
{
  "id": "portfolio_id",
  "name": "John's Portfolio",
  "description": "Full Stack Developer Portfolio",
  "slug": "johns-portfolio",
  "templateId": "template_1",
  "customization": {},
  "viewCount": 25,
  "projects": [
    {
      "id": "project_1",
      "title": "E-commerce App",
      "description": "A modern e-commerce application",
      "imageUrl": "/uploads/ecommerce.jpg",
      "projectUrl": "https://github.com/john/ecommerce",
      "tags": ["React", "Node.js", "MongoDB"],
      "order": 1
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

---

## File Upload

#### Upload File

```http
POST /upload
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
- `file`: The file to upload (image, PDF, document)

**Response:**
```json
{
  "url": "/uploads/filename.jpg"
}
```

**Supported File Types:**
- Images: JPEG, PNG, GIF
- Documents: PDF, DOC, DOCX

**File Size Limit:** 5MB

---

## Error Responses

### HTTP Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Errors

#### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

#### 400 Bad Request (Validation Error)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["email"],
      "message": "Required"
    }
  ]
}
```

#### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

#### 404 Not Found
```json
{
  "error": "Portfolio not found"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **Other endpoints**: 100 requests per minute per authenticated user

When rate limits are exceeded, the API returns a `429 Too Many Requests` status.

---

## CORS

The API supports CORS for frontend applications. Allowed origins are configured based on the environment:

- **Development**: `http://localhost:5173`
- **Production**: Your deployed frontend domain

---

## Changelog

### v2.0.0 (Current)
- Replaced Replit Auth with JWT authentication
- Added user registration and login endpoints
- Updated all endpoints to use JWT authentication
- Removed session-based authentication

### v1.0.0
- Initial API with Replit Auth integration
- Portfolio, project, and template management
- File upload functionality