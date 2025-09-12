# Mahalaxmi Full-Stack Application

A complete full-stack startup website built with **Next.js (TypeScript + TailwindCSS)** frontend and **FastAPI (Python)** backend.

## 🚀 Features

### Frontend (Next.js)
- **Modern Stack**: Next.js 15, TypeScript, TailwindCSS v4
- **Responsive Design**: Mobile-first, optimized for all devices
- **Authentication**: JWT-based auth with role management (User/Admin)
- **Dynamic Navigation**: Menu items loaded from backend
- **Blog System**: Dynamic blog listing, detail pages, comments
- **Contact Forms**: Contact form and newsletter subscription
- **Admin Panel**: Protected admin routes for content management
- **Theme Support**: Dark/light mode toggle

### Backend (FastAPI)
- **FastAPI Framework**: High-performance Python web framework
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with role-based access control
- **API Endpoints**: Complete REST API for all frontend features
- **Data Models**: User, Blog, Tag, Feature, Testimonial, Contact, Newsletter
- **Admin Features**: Full CRUD operations for content management
- **Comments System**: Blog comments with approval workflow
- **Dynamic Content**: Menu items, features, testimonials managed via API

## 📋 Prerequisites

### System Requirements
- **Python 3.8+**
- **Node.js 18+**
- **PostgreSQL 12+**

### Python Dependencies
- FastAPI
- SQLAlchemy (async)
- PostgreSQL driver (asyncpg)
- JWT authentication
- Password hashing

### Node.js Dependencies
- Next.js 15
- TypeScript
- TailwindCSS v4
- Authentication context

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/anikamustudy/mahalaxmi.git
cd mahalaxmi
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Database
1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE mahalaxmi;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mahalaxmi TO postgres;
```

2. Copy environment file and update database URL:
```bash
cp .env.example .env
```

Edit `.env` file:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/mahalaxmi
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
FIRST_ADMIN_EMAIL=admin@mahalaxmi.com
FIRST_ADMIN_PASSWORD=admin123
```

#### Initialize Database & Seed Data
```bash
python seed_data.py
```

#### Start Backend Server
```bash
python main.py
# OR
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The FastAPI server will be running at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### 3. Frontend Setup

#### Install Node.js Dependencies
```bash
cd .. # Back to root directory
npm install
```

#### Configure Environment
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Start Frontend Development Server
```bash
npm run dev
```

The Next.js frontend will be running at `http://localhost:3000`

## 🗄️ Database Schema

### Key Models
- **User**: Authentication, roles (USER/ADMIN)
- **Blog**: Articles with author, tags, comments
- **Tag**: Blog categorization
- **Comment**: Blog comments with approval system
- **Feature**: Homepage features
- **Testimonial**: Customer testimonials
- **Contact**: Contact form submissions
- **Newsletter**: Email subscriptions
- **MenuItem**: Dynamic navigation menu

## 🔐 Authentication

### User Roles
- **USER**: Can view content, submit comments, subscribe to newsletter
- **ADMIN**: Full access to admin panel, content management, user management

### Default Admin Account
- **Email**: `admin@mahalaxmi.com`
- **Password**: `admin123`

### JWT Token Management
- Tokens stored in localStorage
- Automatic token validation on app load
- Secure logout with token removal

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Blogs
- `GET /api/blogs` - List blogs (with pagination, search, filters)
- `GET /api/blogs/featured` - Get featured blogs
- `GET /api/blogs/{slug}` - Get blog by slug
- `POST /api/blogs` - Create blog (admin only)
- `PUT /api/blogs/{id}` - Update blog (admin only)
- `DELETE /api/blogs/{id}` - Delete blog (admin only)

### Comments
- `GET /api/blogs/{id}/comments` - Get blog comments
- `POST /api/blogs/{id}/comments` - Create comment
- `PUT /api/blogs/comments/{id}/approve` - Approve comment (admin only)
- `DELETE /api/blogs/comments/{id}` - Delete comment (admin only)

### Navigation
- `GET /api/navbar/menu` - Get menu items
- `POST /api/navbar/menu` - Create menu item (admin only)
- `PUT /api/navbar/menu/{id}` - Update menu item (admin only)
- `DELETE /api/navbar/menu/{id}` - Delete menu item (admin only)

### Content Management
- `GET /api/features` - Get features
- `GET /api/testimonials` - Get testimonials
- `POST /api/contact` - Submit contact form
- `POST /api/newsletter/subscribe` - Newsletter subscription
- `POST /api/newsletter/unsubscribe` - Newsletter unsubscription

## 🎨 Frontend Components

### Dynamic Components
- **Header**: Dynamic menu from backend, authentication state
- **Blog Components**: Dynamic blog listing and detail pages
- **Contact Form**: Integrated with backend API
- **Newsletter**: Subscription form with backend integration
- **Authentication**: Login/logout with JWT token management

### Admin Features
- **Protected Routes**: Admin-only access to management pages
- **Blog Management**: Create, edit, delete blogs
- **Comment Moderation**: Approve/reject user comments
- **Content Management**: Manage features, testimonials, menu items

## 🚀 Deployment

### Backend Deployment
1. **Production Environment Variables**:
   - Update `SECRET_KEY` with a secure random key
   - Configure production PostgreSQL database
   - Set appropriate `CORS` origins

2. **Docker Deployment** (Optional):
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Frontend Deployment
1. **Build for Production**:
```bash
npm run build
npm start
```

2. **Environment Variables**:
   - Update `NEXT_PUBLIC_API_URL` to production backend URL

3. **Deploy to Vercel/Netlify**:
   - Connect your Git repository
   - Set environment variables in deployment settings
   - Deploy automatically on push

## 🔧 Development

### Backend Development
- **FastAPI Auto-reload**: Enabled in development mode
- **Database Changes**: Update models in `app/models/models.py`
- **API Documentation**: Auto-generated at `/docs`
- **Testing**: Add tests in `tests/` directory

### Frontend Development
- **Hot Reload**: Automatic page refresh on changes
- **TypeScript**: Type checking for better development experience
- **API Integration**: Centralized in `src/lib/api.ts`
- **Authentication**: Context-based state management

### Adding New Features
1. **Backend**: Add new models, routers, and endpoints
2. **Frontend**: Update API client and create corresponding components
3. **Database**: Run migrations for schema changes

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists

2. **CORS Issues**:
   - Verify `BACKEND_CORS_ORIGINS` includes your frontend URL
   - Check `NEXT_PUBLIC_API_URL` is correct

3. **Authentication Problems**:
   - Clear browser localStorage
   - Check JWT token expiration
   - Verify user exists in database

4. **API Connection Failed**:
   - Ensure backend server is running on port 8000
   - Check network firewall settings
   - Verify API endpoint URLs

### Development Tips
- Use browser developer tools to inspect API calls
- Check FastAPI logs for backend errors
- Use PostgreSQL client to inspect database state
- Test API endpoints using `/docs` interface

## 📄 License

This project is open-source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📧 Support

For questions and support:
- Create an issue on GitHub
- Check the API documentation at `/docs`
- Review this README for setup instructions

---

**Enjoy building with Mahalaxmi Full-Stack! 🚀**
