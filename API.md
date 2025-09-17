# API Documentation

This document describes the API endpoints available in the PortfolioGenie application.

## Base URL

```
http://localhost:5173/api
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### POST `/auth/login`
Authenticate a user and receive a JWT token.

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
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/auth/logout`
Logout the current user (requires authentication).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Portfolios

#### GET `/portfolios`
Get all portfolios for the authenticated user.

**Response:**
```json
{
  "success": true,
  "portfolios": [
    {
      "id": 1,
      "title": "My Portfolio",
      "template": "modern",
      "isPublic": true,
      "createdAt": "2023-01-01T00:00:00Z",
      "updatedAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### GET `/portfolios/:id`
Get a specific portfolio by ID.

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "id": 1,
    "title": "My Portfolio",
    "template": "modern",
    "isPublic": true,
    "content": {
      "personalInfo": {
        "name": "John Doe",
        "title": "Full Stack Developer",
        "bio": "Passionate developer..."
      },
      "projects": [...]
    },
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

#### POST `/portfolios`
Create a new portfolio.

**Request Body:**
```json
{
  "title": "My New Portfolio",
  "template": "modern",
  "content": {
    "personalInfo": {
      "name": "John Doe",
      "title": "Full Stack Developer",
      "bio": "Passionate developer with 5 years of experience"
    }
  },
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "id": 2,
    "title": "My New Portfolio",
    "template": "modern",
    "isPublic": false,
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

#### PUT `/portfolios/:id`
Update an existing portfolio.

**Request Body:**
```json
{
  "title": "Updated Portfolio Title",
  "content": {
    "personalInfo": {
      "name": "John Doe",
      "title": "Senior Full Stack Developer"
    }
  },
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "portfolio": {
    "id": 1,
    "title": "Updated Portfolio Title",
    "template": "modern",
    "isPublic": true,
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

#### DELETE `/portfolios/:id`
Delete a portfolio.

**Response:**
```json
{
  "success": true,
  "message": "Portfolio deleted successfully"
}
```

### Projects

#### GET `/projects`
Get all projects for the authenticated user.

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "title": "E-commerce Website",
      "description": "A full-stack e-commerce solution",
      "technologies": ["React", "Node.js", "MongoDB"],
      "imageUrl": "/uploads/project1.jpg",
      "githubUrl": "https://github.com/user/project",
      "liveUrl": "https://project.com",
      "createdAt": "2023-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/projects`
Create a new project.

**Request Body:**
```json
{
  "title": "New Project",
  "description": "Project description",
  "technologies": ["React", "TypeScript"],
  "githubUrl": "https://github.com/user/new-project",
  "liveUrl": "https://new-project.com"
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": 2,
    "title": "New Project",
    "description": "Project description",
    "technologies": ["React", "TypeScript"],
    "githubUrl": "https://github.com/user/new-project",
    "liveUrl": "https://new-project.com",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

#### PUT `/projects/:id`
Update an existing project.

**Request Body:**
```json
{
  "title": "Updated Project Title",
  "description": "Updated description",
  "technologies": ["React", "TypeScript", "Tailwind CSS"]
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "id": 1,
    "title": "Updated Project Title",
    "description": "Updated description",
    "technologies": ["React", "TypeScript", "Tailwind CSS"],
    "updatedAt": "2023-01-01T00:00:00Z"
  }
}
```

#### DELETE `/projects/:id`
Delete a project.

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### File Upload

#### POST `/upload`
Upload a file (image, document, etc.).

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with file field

**Response:**
```json
{
  "success": true,
  "fileUrl": "/uploads/filename.jpg",
  "fileName": "filename.jpg",
  "fileSize": 102400
}
```

### Templates

#### GET `/templates`
Get all available portfolio templates.

**Response:**
```json
{
  "success": true,
  "templates": [
    {
      "id": "modern",
      "name": "Modern",
      "description": "A clean, modern design perfect for developers",
      "previewUrl": "/templates/modern/preview.jpg",
      "features": ["Responsive", "Dark mode", "Animations"]
    },
    {
      "id": "creative",
      "name": "Creative",
      "description": "Bold and colorful design for creative professionals",
      "previewUrl": "/templates/creative/preview.jpg",
      "features": ["Colorful", "Portfolio grid", "Contact form"]
    }
  ]
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required",
  "message": "Please log in to access this resource"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found",
  "message": "The requested portfolio was not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Something went wrong on our end"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **File upload endpoints**: 10 requests per minute
- **Other endpoints**: 100 requests per minute

When rate limit is exceeded:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60
}
```

## Webhooks

### Portfolio Published
Triggered when a portfolio is made public.

**Payload:**
```json
{
  "event": "portfolio.published",
  "data": {
    "portfolioId": 1,
    "userId": 1,
    "portfolioUrl": "https://portfoliogenie.com/portfolio/1",
    "publishedAt": "2023-01-01T00:00:00Z"
  }
}
```

### Project Added
Triggered when a new project is added to a portfolio.

**Payload:**
```json
{
  "event": "project.added",
  "data": {
    "projectId": 1,
    "portfolioId": 1,
    "userId": 1,
    "projectTitle": "New Project",
    "addedAt": "2023-01-01T00:00:00Z"
  }
}
```