import whisper
import os

# Load model once
model = whisper.load_model("base")

os.environ["PATH"] += os.pathsep + r"C:\Users\AARYAN KALE\Downloads\ffmpeg-8.1-essentials_build\ffmpeg-8.1-essentials_build\bin"

def verify_challenge_phrase(audio_path: str, challenge_phrase: str):
    """
    Verifies whether the user spoke the expected challenge phrase.
    """

    try:
        if not os.path.exists(audio_path):
            return {
                "status": "error",
                "message": f"Audio file not found: {audio_path}"
            }

        result = model.transcribe(audio_path)

        spoken = result["text"].strip().lower()
        expected = challenge_phrase.strip().lower()

        phrase_match = expected in spoken

        return {
            "status": "success",
            "expected_phrase": expected,
            "spoken_phrase": spoken,
            "phrase_match": phrase_match,
            "decision": "passed" if phrase_match else "failed"
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


import os

if __name__ == "__main__":

    challenge_phrase = "secure banking for everyone"

    base_dir = os.path.dirname(os.path.abspath(__file__))

    audio_path = os.path.join(
        base_dir,
        "samples",
        "other_person",
        "SecureBanking.wav"
    )

    print("Checking file:", audio_path)
    print("Exists:", os.path.exists(audio_path))

    result = verify_challenge_phrase(
        audio_path=audio_path,
        challenge_phrase=challenge_phrase
    )

    print(result)