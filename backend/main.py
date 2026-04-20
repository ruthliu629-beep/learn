import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from database import engine
import models
from routers import auth_router, languages, vocabulary, quiz, progress, cultural, tts

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LangLearn API", version="1.0.0", description="多语言学习平台 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(languages.router)
app.include_router(vocabulary.router)
app.include_router(quiz.router)
app.include_router(progress.router)
app.include_router(cultural.router)
app.include_router(tts.router)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, "..", "frontend")


@app.get("/")
async def serve_index():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))


@app.get("/app")
async def serve_app():
    return FileResponse(os.path.join(FRONTEND_DIR, "app.html"))


app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")
