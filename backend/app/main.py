from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.session import SessionLocal
from app.db.base import Base

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_app() -> FastAPI:
    app = FastAPI(title="USV envent manager")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # TODO: include routers here
    # from app.api.v1.routes_handler import api_router
    # app.include_router(api_router, prefix="/api/v1")

    return app

app = create_app()