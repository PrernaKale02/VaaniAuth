import os
import uuid
import logging
import asyncio
from typing import Any, Dict

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse

from fraud_detection import detect_voice_fraud, detect_deepfake_voice
from speechbrain_improved import register_user, verify_user
from whisper_service import verify_challenge_phrase
from risk_engine import calculate_final_risk


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Voice Biometric Auth Service")


async def save_upload_file(upload_file: UploadFile, dest_path: str) -> None:
    """Save `UploadFile` contents to `dest_path` asynchronously."""
    try:
        with open(dest_path, "wb") as f:
            while True:
                chunk = await upload_file.read(1024 * 1024)
                if not chunk:
                    break
                f.write(chunk)
    finally:
        try:
            await upload_file.close()
        except Exception:
            pass


def remove_file_silent(path: str) -> None:
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception as e:
        logger.debug("Failed removing file %s: %s", path, e)


def generate_upload_path(original_filename: str) -> str:
    ext = os.path.splitext(original_filename)[1]
    if not ext:
        ext = ".wav"
    return os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{ext}")


async def run_blocking(func, *args, **kwargs):
    """Run a blocking function in a thread to avoid blocking the event loop."""
    return await asyncio.to_thread(func, *args, **kwargs)


def combine_fraud_and_deepfake(
    fraud_result: Dict[str, Any], deepfake_result: Dict[str, Any]
) -> Dict[str, Any]:
    """Combine two detector outputs into a single fraud decision.

    Decision priorities:
    - If either detector is high confidence (score >= 50) or labels indicate 'likely' -> 'rejected'
    - If either is moderate (score >= 25 or label 'suspicious') -> 'suspicious'
    - Otherwise -> 'accepted'
    """
    fraud_score = fraud_result.get("fraud_score", 0)
    deepfake_score = deepfake_result.get("deepfake_score", 0)
    fraud_label = fraud_result.get("fraud_label", "")
    deepfake_label = deepfake_result.get("deepfake_label", "")

    if (
        fraud_score >= 50
        or deepfake_score >= 50
        or fraud_label == "likely_replay_or_synthetic"
        or deepfake_label == "likely_ai_generated"
    ):
        decision = "rejected"
    elif (
        fraud_score >= 25
        or deepfake_score >= 25
        or fraud_label == "suspicious"
        or deepfake_label == "suspicious"
    ):
        decision = "suspicious"
    else:
        decision = "accepted"

    return {
        "fraud_result": fraud_result,
        "deepfake_result": deepfake_result,
        "decision": decision,
    }


@app.on_event("startup")
def startup():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    logger.info("Uploads directory: %s", UPLOAD_DIR)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/register")
async def register_endpoint(user_id: str = Form(...), file: UploadFile = File(...)):
    dest_path = generate_upload_path(file.filename)
    try:
        await save_upload_file(file, dest_path)

        result = await run_blocking(register_user, user_id, dest_path)

        return JSONResponse(status_code=200, content=result)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Register error")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        remove_file_silent(dest_path)


@app.post("/authenticate")
async def authenticate_endpoint(
    user_id: str = Form(...),
    challenge_phrase: str = Form(...),
    file: UploadFile = File(...),
):
    dest_path = generate_upload_path(file.filename)
    try:
        await save_upload_file(file, dest_path)

        # Run CPU/blocking tasks concurrently in threads
        fraud_task = run_blocking(detect_voice_fraud, dest_path)
        deepfake_task = run_blocking(detect_deepfake_voice, dest_path)
        speaker_task = run_blocking(verify_user, user_id, dest_path)
        phrase_task = run_blocking(verify_challenge_phrase, dest_path, challenge_phrase)

        fraud_result, deepfake_result, speaker_result, phrase_result = await asyncio.gather(
            fraud_task, deepfake_task, speaker_task, phrase_task
        )

        combined_fraud = combine_fraud_and_deepfake(fraud_result, deepfake_result)

        # Prepare a fraud dict for the risk engine (it expects a 'decision' key)
        fraud_for_risk = dict(fraud_result)
        fraud_for_risk["deepfake_score"] = deepfake_result.get("deepfake_score")
        fraud_for_risk["deepfake_label"] = deepfake_result.get("deepfake_label")
        fraud_for_risk["decision"] = combined_fraud["decision"]

        risk_result = await run_blocking(
            calculate_final_risk, speaker_result, phrase_result, fraud_for_risk
        )

        response = {
            "speaker_result": speaker_result,
            "phrase_result": phrase_result,
            "fraud_result": fraud_result,
            "deepfake_result": deepfake_result,
            "combined_fraud": combined_fraud,
            "risk_result": risk_result,
        }

        return JSONResponse(status_code=200, content=response)

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Authentication error")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        remove_file_silent(dest_path)
