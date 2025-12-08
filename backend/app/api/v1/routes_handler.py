from fastapi import APIRouter
from app.api.v1.routers import auth
from app.api.v1.routers import events
from backend.app.api.v1.routers import registrations
from backend.app.api.v1.routers import locations
from backend.app.api.v1.routers import categories

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(events.router, prefix="/events")
api_router.include_router(registrations.router, prefix="/registrations")
api_router.include_router(locations.router, prefix="/locations")
api_router.include_router(categories.router, prefix="/categories")
