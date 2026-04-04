import numpy as np
import librosa
import os


def extract_voice_features(audio_path: str):
    """
    Extracts audio features useful for fraud detection.
    Returns a dictionary of feature values.
    """

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    y, sr = librosa.load(audio_path, sr=16000)

    # Pitch extraction
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch_values = pitches[pitches > 0]
    pitch_values = pitch_values[pitch_values < 400]

    pitch_variation = (
        np.std(pitch_values) if len(pitch_values) > 0 else 0
    )

    # Spectral flatness (detects overly smooth audio)
    spectral_flatness = librosa.feature.spectral_flatness(y=y).mean()

    # Background noise variance
    background_variance = np.var(y)

    # Zero crossing rate (waveform activity)
    zcr = librosa.feature.zero_crossing_rate(y).mean()

    # RMS energy (helps detect unnatural silence patterns)
    rms = librosa.feature.rms(y=y).mean()

    # Silence ratio (portion of near-silent samples)
    silence_ratio = np.mean(np.abs(y) < 0.01)

    return {
    "pitch_variation": float(pitch_variation),
    "spectral_flatness": float(spectral_flatness),
    "background_variance": float(background_variance),
    "zero_crossing_rate": float(zcr),
    "rms_energy": float(rms),
    "silence_ratio": float(silence_ratio)
    }


def detect_voice_fraud(audio_path: str):
    """
    Detects potential replay attacks or synthetic voices
    using heuristic rules.
    """

    features = extract_voice_features(audio_path)

    fraud_score = 0
    reasons = []

    # 1. Background variance (MOST IMPORTANT for replay)
    if features["background_variance"] < 0.0002:
        fraud_score += 30
        reasons.append("very_low_background_variance")

    # 2. Spectral flatness (more relaxed)
    if features["spectral_flatness"] < 0.008:
        fraud_score += 20
        reasons.append("overly_flat_spectrum")

    # 3. Pitch variation (reduce sensitivity)
    if features["pitch_variation"] < 50:
        fraud_score += 20
        reasons.append("low_pitch_variation")

    # 4. Zero crossing (adjust threshold)
    if features["zero_crossing_rate"] < 0.03:
        fraud_score += 15
        reasons.append("low_wave_activity")

    # 5. RMS energy (optional minor factor)
    if features["rms_energy"] < 0.008:
        fraud_score += 15
        reasons.append("low_energy")

    # Silence ratio (replay often has cleaner silence)
    if features["silence_ratio"] > 0.75:
        fraud_score += 20
        reasons.append("too_much_clean_silence")

    # Risk classification
    if fraud_score >= 50:
        label = "likely_replay_or_synthetic"

    elif fraud_score >= 25:
        label = "suspicious"

    else:
        label = "natural_voice"
    return {
        "fraud_score": fraud_score,
        "fraud_label": label,
        "reasons": reasons,
        "features": features
    }

def extract_deepfake_features(audio_path: str):

    y, sr = librosa.load(audio_path, sr=16000)

    # Spectral centroid variation
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    centroid_var = np.var(centroid)

    # Spectral bandwidth variation
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    bandwidth_var = np.var(bandwidth)

    # Energy variation
    rms = librosa.feature.rms(y=y)
    energy_var = np.var(rms)

    # Pitch jitter approximation
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
    pitch_values = pitches[pitches > 0]

    if len(pitch_values) > 0:
        pitch_jitter = np.std(np.diff(pitch_values))
    else:
        pitch_jitter = 0

    return {
        "centroid_variance": float(centroid_var),
        "bandwidth_variance": float(bandwidth_var),
        "energy_variance": float(energy_var),
        "pitch_jitter": float(pitch_jitter)
    }

def detect_deepfake_voice(audio_path: str):

    features = extract_deepfake_features(audio_path)

    deepfake_score = 0
    reasons = []

    if features["centroid_variance"] < 200:
        deepfake_score += 25
        reasons.append("low_spectral_centroid_variance")

    if features["bandwidth_variance"] < 300:
        deepfake_score += 25
        reasons.append("low_bandwidth_variance")

    if features["energy_variance"] < 0.0005:
        deepfake_score += 25
        reasons.append("uniform_energy_pattern")

    if features["pitch_jitter"] < 1:
        deepfake_score += 25
        reasons.append("low_pitch_jitter")

    if deepfake_score >= 50:
        label = "likely_ai_generated"

    elif deepfake_score >= 25:
        label = "suspicious"

    else:
        label = "natural_voice"

    return {
        "deepfake_score": deepfake_score,
        "deepfake_label": label,
        "reasons": reasons,
        "features": features
    }

def get_fraud_risk_level(fraud_score: int):
    """
    Converts fraud score into risk level.
    """

    if fraud_score >= 60:
        return {
            "risk_level": "high",
            "risk_score": 90
        }

    elif fraud_score >= 30:
        return {
            "risk_level": "medium",
            "risk_score": 50
        }

    else:
        return {
            "risk_level": "low",
            "risk_score": 10
        }


if __name__ == "__main__":

    test_files = {
        "REAL VOICE": "samples/real/prerna.wav",
        "RECORDED REPLAY": "samples/recorded/prerna_recorded.wav",
        "OTHER PERSON": "samples/other_person/SecureBanking.wav"
    }

    for label, path in test_files.items():

        print("\n==============================")
        print(f"TEST CASE: {label}")
        print("==============================")

        result = detect_voice_fraud(path)

        print("Fraud Score:", result["fraud_score"])
        print("Fraud Label:", result["fraud_label"])
        print("Reasons:", result["reasons"])
        print("Features:", result["features"])
        
    deepfake_result = detect_deepfake_voice(path)

    print("\nDeepfake Score:", deepfake_result["deepfake_score"])
    print("Deepfake Label:", deepfake_result["deepfake_label"])
    print("Deepfake Reasons:", deepfake_result["reasons"])