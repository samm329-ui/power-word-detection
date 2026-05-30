import os
import sys

# CRITICAL: Set up FFmpeg PATH before importing anything that needs it.
# sentence_transformers -> torchcodec requires FFmpeg DLLs to be loadable.
# This must happen at import time, before any caption_engine imports.
def _setup_ffmpeg_path():
    # Try loading from .env file directly (before dotenv is available)
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
    ffmpeg_path = None
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line.startswith('FFMPEG_PATH='):
                    ffmpeg_path = line.split('=', 1)[1].strip().strip('"').strip("'")
                    break

    # Handle escaped backslashes from .env (e.g. C:\\ffmpeg\\bin\\ffmpeg.exe)
    if ffmpeg_path:
        ffmpeg_path = ffmpeg_path.replace('\\\\', '\\').replace('\\:', ':')

    if ffmpeg_path and os.path.exists(ffmpeg_path):
        ffmpeg_dir = os.path.dirname(ffmpeg_path)
        if ffmpeg_dir not in os.environ.get("PATH", ""):
            os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
            sys.stdout.write(f"INFO: Added FFmpeg to PATH: {ffmpeg_dir}\n")
    else:
        sys.stdout.write(f"WARNING: FFMPEG_PATH not found or invalid in .env (looked for: {ffmpeg_path})\n")

_setup_ffmpeg_path()

# Now safe to import everything else
from dotenv import load_dotenv
load_dotenv()

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .database import init_db
from .api import health, jobs


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()

    if not os.getenv("GROQ_API_KEY") or "your_groq_api_key" in os.getenv("GROQ_API_KEY", ""):
        print("WARNING: GROQ_API_KEY is not set or is still a placeholder. Transcription will fail.")

    yield
    print("Shutting down the backend...")


app = FastAPI(
    title="Power Word Detection Backend",
    version="2.0.0",
    lifespan=lifespan,
    redirect_slashes=False
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
