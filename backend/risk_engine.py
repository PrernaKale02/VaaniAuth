def calculate_final_risk(
    speaker_result,
    phrase_result,
    fraud_result
):
    risk_score = 0
    reasons = []

    # Speaker verification
    if speaker_result["decision"] == "accepted":
        risk_score += 10
    elif speaker_result["decision"] == "suspicious":
        risk_score += 40
        reasons.append("speaker_similarity_low")
    else:
        risk_score += 80
        reasons.append("speaker_mismatch")

    # Challenge phrase / liveness
    if not phrase_result["phrase_match"]:
        risk_score += 40
        reasons.append("challenge_phrase_failed")

    # Fraud / replay detection
    if fraud_result["decision"] == "suspicious":
        risk_score += 30
        reasons.append("voice_fraud_suspicious")

    elif fraud_result["decision"] == "rejected":
        risk_score += 60
        reasons.append("voice_fraud_detected")

    # Final label
    if risk_score <= 30:
        final_decision = "authenticated"

    elif risk_score <= 70:
        final_decision = "step_up_auth_required"

    else:
        final_decision = "blocked"

    return {
        "status": "success",
        "risk_score": min(risk_score, 100),
        "decision": final_decision,
        "reasons": reasons
    }