import uvicorn
import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware import Middleware
from starlette.middleware.sessions import SessionMiddleware
from app.routers import templates, static_files, router, api_router
from app.config import get_settings
from contextlib import asynccontextmanager
import app.models


#This sets up the database and seeds it with the initial data when the app starts. DO NOT MODIFY IT
@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.database import create_db_and_tables
    from app.cli import seed
    
    create_db_and_tables()
    seed()
    yield


app = FastAPI(
    middleware=[Middleware(SessionMiddleware, secret_key=get_settings().secret_key)],
    lifespan=lifespan
)

# I HATE CORS I HATE CORS I HATE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"], # 3000 is for Chris just in case he uses create-react-app again
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.mount("/static", static_files, name="static")

# send the react app to the browser
# PLEASE do not move the frontend folder or everything breaks. 
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="react-assets")

# Catch-all to let React Router do its thing
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_react(full_path: str):
    index = os.path.join(FRONTEND_DIST, "index.html")
    # If this fails, you probably forgot the cd frontend && npm run build. Again.
    return FileResponse(index)
    # return {"message": "Frontend not built. Run: cd frontend && npm run build"} # uncomment if you want the ugly JSON error back

app.include_router(router)

#added this so we stop getting raw JSON 401s in the browser when testing
@app.exception_handler(status.HTTP_401_UNAUTHORIZED)
async def unauthorized_redirect_handler(request: Request, exc: Exception):
    return templates.TemplateResponse(request=request, name="401.html")

if __name__ == "__main__":
    #this works now so do not touch it
    uvicorn.run(
        "app.main:app",
        host=get_settings().app_host,
        port=get_settings().app_port,
        reload=get_settings().env.lower() != "production"
    )