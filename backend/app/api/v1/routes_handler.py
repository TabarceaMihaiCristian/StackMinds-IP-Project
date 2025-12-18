from fastapi import APIRouter
from app.api.v1.routers import auth
from app.api.v1.routers import events
from app.api.v1.routers import registrations
from app.api.v1.routers import dashboard
from app.api.v1.routers import users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(events.router)
api_router.include_router(registrations.router)
api_router.include_router(dashboard.router)
api_router.include_router(users.router)
