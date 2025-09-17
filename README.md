# PortfolioGenie

A modern, full-stack portfolio generation application that allows users to create stunning portfolios with ease.

## 🚀 Features

- **Dynamic Portfolio Creation**: Create beautiful portfolios using pre-built templates
- **Project Upload**: Upload and showcase your projects with images and descriptions
- **Multiple Templates**: Choose from various professionally designed portfolio templates
- **Responsive Design**: Portfolios look great on all devices
- **Real-time Preview**: See your portfolio as you build it
- **Authentication**: Secure user authentication system
- **Dashboard**: Manage all your portfolios from a centralized dashboard

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** components library
- **React Query** for state management
- **React Router** for navigation

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **Drizzle ORM** for database operations
- **SQLite** database
- **File upload handling** for project assets

### Development Tools
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **PostCSS** for CSS processing
- **Git** for version control

## 📁 Project Structure

```
PortfolioGenie/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/        # Shadcn/ui components
│   │   │   ├── portfolio-templates.tsx
│   │   │   └── project-upload.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── pages/         # Main application pages
│   │   └── App.tsx        # Main application component
│   └── index.html         # HTML entry point
├── server/                # Backend API server
│   ├── db.ts             # Database configuration
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # File storage handling
│   └── replitAuth.ts     # Authentication logic
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sinsweatpants/PortfolioGenie.git
   cd PortfolioGenie
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run lint` - Run ESLint for code quality checks

## 🎨 Components Overview

### Core Components

- **`PortfolioTemplates`** - Displays available portfolio templates
- **`ProjectUpload`** - Handles project file uploads and form submission
- **UI Components** - Complete set of reusable UI components from Shadcn/ui

### Pages

- **`Landing`** - Welcome page with feature overview
- **`Dashboard`** - User dashboard for managing portfolios
- **`PortfolioEditor`** - Interface for creating and editing portfolios
- **`PortfolioView`** - Public view of generated portfolios

### Hooks

- **`useAuth`** - Authentication state management
- **`useToast`** - Toast notification system
- **`useMobile`** - Mobile device detection

## 🗄️ Database Schema

The application uses Drizzle ORM with SQLite for data persistence:

- **Users** - User authentication and profile data
- **Portfolios** - Portfolio configurations and metadata
- **Projects** - Individual project information and assets

## 🔐 Authentication

The application implements secure authentication using:
- JWT tokens for session management
- Secure password hashing
- Protected routes and middleware

## 📱 Responsive Design

PortfolioGenie is built with mobile-first design principles:
- Responsive grid layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🚀 Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=./portfolio.db

# Authentication
JWT_SECRET=your-jwt-secret-here

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues and Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/sinsweatpants/PortfolioGenie/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce any bugs

## 🙏 Acknowledgments

- [Shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast development experience
- [Drizzle ORM](https://orm.drizzle.team/) for the TypeScript database toolkit

---

**Happy coding! 🎉**