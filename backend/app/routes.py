from flask import Blueprint, Response, jsonify
from backend.camera.stream import generate_frames
import json
import os

api = Blueprint("api", __name__)

EVENTS_FILE = "backend/events/events.json"


@api.route("/api/stream")
def stream():
    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@api.route("/api/events")
def get_events():
    if not os.path.exists(EVENTS_FILE):
        return jsonify({"events": []})

    try:
        with open(EVENTS_FILE, "r") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return jsonify({"events": []})

    return jsonify(data)


@api.route("/api/stats")
def get_stats():
    if not os.path.exists(EVENTS_FILE):
        return jsonify({
            "motion": False,
            "area": 0
        })

    try:
        with open(EVENTS_FILE, "r") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        return jsonify({
            "motion": False,
            "area": 0
        })

    events = data.get("events", [])

    return jsonify({
        "motion": len(events) > 0,
        "area": events[0].get("motion_area", 0) if events else 0
    })
