from flask import Blueprint, Response, jsonify
import cv2

from backend.camera.camera_controller import CameraController

api = Blueprint("api", __name__)
camera = CameraController()


@api.route("/api/stats")
def stats():
    return jsonify({
        "intrusions": 0,
        "motion": 0,
        "objects": 0
    })


def generate_frames():
    while True:
        frame = camera.get_frame()
        success, buffer = cv2.imencode(".jpg", frame)
        if not success:
            continue

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + buffer.tobytes()
            + b"\r\n"
        )


@api.route("/api/stream")
def stream():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )
