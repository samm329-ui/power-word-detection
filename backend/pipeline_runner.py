import os
import json
import asyncio
import logging
from .database import DB_PATH
import aiosqlite
from .progress import manager

# Lazy import of caption_engine to avoid loading ML libs at startup
run_pipeline = None

logger = logging.getLogger(__name__)

async def update_job_status(job_id: str, status: str, progress: int = None,
                            error: str = None, srt: str = None, vtt: str = None,
                            segments: list = None):
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            updates = []
            params = []

            updates.append("status = ?")
            params.append(status)

            if progress is not None:
                updates.append("progress = ?")
                params.append(progress)

            if error is not None:
                updates.append("error = ?")
                params.append(error)

            if srt is not None:
                updates.append("srt_content = ?")
                params.append(srt)

            if vtt is not None:
                updates.append("vtt_content = ?")
                params.append(vtt)

            if segments is not None:
                updates.append("segments_json = ?")
                params.append(json.dumps(segments))

            if status in ['completed', 'failed']:
                updates.append("completed_at = CURRENT_TIMESTAMP")

            query = f"UPDATE jobs SET {', '.join(updates)} WHERE id = ?"
            params.append(job_id)

            await db.execute(query, tuple(params))
            await db.commit()
            logger.info(f"Job {job_id} status updated to: {status}")
    except Exception as e:
        logger.error(f"Failed to update job {job_id} status: {e}")

def run_pipeline_sync(job_id: str, video_path: str, target_lang: str, intensity: str = "medium"):
    """
    Synchronous wrapper to run the pipeline.
    This runs in a separate thread but needs to send async websocket messages.
    """
    # Create an event loop for the async connection manager
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    def on_progress(status: str, percent: int, details: str = ""):
        # 1. Update DB synchronously (via a quick async call wrapped in the loop)
        try:
            loop.run_until_complete(update_job_status(job_id, status, percent))
        except Exception as e:
            logger.error(f"Failed to update DB for job {job_id}: {e}")
        # 2. Broadcast WebSocket progress
        try:
            loop.run_until_complete(manager.broadcast_progress(job_id, status, percent, details))
        except Exception as e:
            logger.error(f"Failed to broadcast for job {job_id}: {e}")

    try:
        logger.info(f"Job {job_id} starting pipeline for {video_path}")
        on_progress("Pipeline started", 1)

        # Lazy import — only loads ML libs (sentence_transformers, torch, etc.) when a job actually runs
        global run_pipeline
        if run_pipeline is None:
            logger.info("Loading AI pipeline modules (first run may take a moment)...")
            from caption_engine.main import run_pipeline as _rp
            run_pipeline = _rp

        # Run the heavy AI pipeline
        result = run_pipeline(
            video_path=video_path,
            user_target_lang=target_lang,
            progress_callback=on_progress,
            intensity=intensity,
        )
        
        logger.info(f"Job {job_id} pipeline returned: {result.get('status', 'unknown')}")
        
        if result["status"] == "success":
            # Complete
            logger.info(f"Job {job_id} Completed successfully, updating DB...")
            loop.run_until_complete(
                update_job_status(
                    job_id, "completed", 100,
                    srt=result.get("srt"), vtt=result.get("vtt"),
                    segments=result.get("segments")
                )
            )
            loop.run_until_complete(
                manager.broadcast_progress(job_id, "completed", 100, "Captioning finished successfully.")
            )
            logger.info(f"Job {job_id} DB updated to completed")
        else:
            # Error returned gracefully
            err_msg = result.get("message", "Unknown pipeline error")
            logger.error(f"Job {job_id} Failed gracefully: {err_msg}")
            loop.run_until_complete(update_job_status(job_id, "failed", error=err_msg))
            loop.run_until_complete(manager.broadcast_progress(job_id, "failed", 0, err_msg))

    except Exception as e:
        logger.exception(f"Job {job_id} Pipeline crashed.")
        loop.run_until_complete(update_job_status(job_id, "failed", error=str(e)))
        loop.run_until_complete(manager.broadcast_progress(job_id, "failed", 0, str(e)))
        
    finally:
        loop.close()
        logger.info(f"Job {job_id} thread finished")
