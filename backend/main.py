from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.database import create_tables
from app.routers import auth, blogs, users, navbar, testimonials, features, contact, newsletter


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    await create_tables()
    yield


app = FastAPI(
    title="Mahalaxmi API",
    description="Backend API for Mahalaxmi startup website",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["blogs"])
app.include_router(navbar.router, prefix="/api/navbar", tags=["navbar"])
app.include_router(testimonials.router, prefix="/api/testimonials", tags=["testimonials"])
app.include_router(features.router, prefix="/api/features", tags=["features"])
app.include_router(contact.router, prefix="/api/contact", tags=["contact"])
app.include_router(newsletter.router, prefix="/api/newsletter", tags=["newsletter"])


@app.get("/")
async def root():
    return {"message": "Mahalaxmi API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
