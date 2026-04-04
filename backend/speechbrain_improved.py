import os
import numpy as np
import torchaudio
import torch
import soundfile as sf
from speechbrain.inference.speaker import EncoderClassifier
from speechbrain.utils.fetching import LocalStrategy
from sklearn.metrics.pairwise import cosine_similarity

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------

# Optional: ffmpeg path for Windows if required
os.environ["PATH"] += os.pathsep + r"C:\Users\aryan\Downloads\ffmpeg-8.1-essentials_build\ffmpeg-8.1-essentials_build\bin"

# Avoid HuggingFace symlink warning on Windows
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

USER_FOLDER = "users"
MODEL_FOLDER = "models/speechbrain_ecapa"

os.makedirs(USER_FOLDER, exist_ok=True)
os.makedirs("models", exist_ok=True)

# -------------------------------------------------------------------
# Load pretrained SpeechBrain model once
# -------------------------------------------------------------------

classifier = EncoderClassifier.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir=MODEL_FOLDER,
    local_strategy=LocalStrategy.COPY
)

# -------------------------------------------------------------------
# Audio Preprocessing + Embedding Extraction
# -------------------------------------------------------------------

def extract_embedding(audio_path: str):
    """
    Extract speaker embedding from an audio file.
    Returns:
        np.ndarray
    """

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Load audio
    signal, fs = sf.read(audio_path)

    # Convert stereo -> mono
    if len(signal.shape) > 1:
        signal = signal.mean(axis=1)

    # Convert to float tensor
    signal = torch.tensor(signal, dtype=torch.float32).unsqueeze(0)

    # Resample to 16kHz if required
    if fs != 16000:
        resampler = torchaudio.transforms.Resample(
            orig_freq=fs,
            new_freq=16000
        )
        signal = resampler(signal)

    # Extract embedding
    embedding = classifier.encode_batch(signal)

    return embedding.squeeze().detach().cpu().numpy()


# -------------------------------------------------------------------
# Register User
# -------------------------------------------------------------------

def register_user(user_id: str, audio_path: str):
    """
    Registers a user by extracting and storing their speaker embedding.
    """

    try:
        embedding = extract_embedding(audio_path)

        save_path = os.path.join(
            USER_FOLDER,
            f"{user_id}_embedding.npy"
        )

        np.save(save_path, embedding)

        return {
            "status": "success",
            "user_id": user_id,
            "message": f"User '{user_id}' registered successfully",
            "embedding_path": save_path
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# -------------------------------------------------------------------
# Verify User
# -------------------------------------------------------------------

def verify_user(user_id: str, audio_path: str):
    """
    Verifies whether the provided voice matches the registered user.
    """

    try:
        stored_path = os.path.join(
            USER_FOLDER,
            f"{user_id}_embedding.npy"
        )

        if not os.path.exists(stored_path):
            return {
                "status": "error",
                "message": f"No registered voice found for user '{user_id}'"
            }

        stored_embedding = np.load(stored_path)
        current_embedding = extract_embedding(audio_path)

        similarity = cosine_similarity(
            [stored_embedding],
            [current_embedding]
        )[0][0]

        similarity = float(similarity)

        # Decision thresholds
        if similarity >= 0.80:
            decision = "accepted"
            confidence = "high"

        elif similarity >= 0.65:
            decision = "suspicious"
            confidence = "medium"

        else:
            decision = "rejected"
            confidence = "low"

        return {
            "status": "success",
            "user_id": user_id,
            "similarity_score": round(similarity, 4),
            "confidence": confidence,
            "decision": decision
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


# -------------------------------------------------------------------
# Optional Risk Helper
# -------------------------------------------------------------------

def get_risk_score(similarity_score: float):
    """
    Converts similarity score into a risk score (0-100).
    Lower score = higher risk.
    """

    if similarity_score >= 0.80:
        return {
            "risk_score": 10,
            "risk_level": "low"
        }

    elif similarity_score >= 0.65:
        return {
            "risk_score": 45,
            "risk_level": "medium"
        }

    else:
        return {
            "risk_score": 85,
            "risk_level": "high"
        }


# -------------------------------------------------------------------
# Local Testing
# -------------------------------------------------------------------

if __name__ == "__main__":

    print("\n--- REGISTER USER ---")
    register_result = register_user(
        user_id="aryan",
        audio_path="samples/Register.wav"
    )
    print(register_result)

    print("\n--- VERIFY USER ---")
    verify_result = verify_user(
        user_id="aryan",
        audio_path="samples/Mom.wav"
    )
    print(verify_result)

    # Optional risk score preview
    if verify_result["status"] == "success":
        risk = get_risk_score(
            verify_result["similarity_score"]
        )
        print("\n--- RISK SCORE ---")
        print(risk)