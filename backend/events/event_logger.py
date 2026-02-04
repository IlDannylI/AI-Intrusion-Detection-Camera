import json
import os
from datetime import datetime

EVENTS_FILE = "backend/events/events.json"

# Ensure events file exists
os.makedirs(os.path.dirname(EVENTS_FILE), exist_ok=True)

if not os.path.exists(EVENTS_FILE):
    with open(EVENTS_FILE, "w") as f:
        json.dump({"events": []}, f, indent=2)


def log_event(event_type, snapshot, metadata=None):
    """
    Logs an event to events.json

    event_type: str (e.g. "intrusion")
    snapshot: filename of snapshot image
    metadata: dict (optional)
    """

    if metadata is None:
        metadata = {}

    with open(EVENTS_FILE, "r") as f:
        data = json.load(f)

    event_id = len(data["events"]) + 1

    event = {
        "id": event_id,
        "type": event_type,
        "snapshot": snapshot,
        "timestamp": datetime.now().isoformat(),
        **metadata
    }

    data["events"].insert(0, event)  # newest first

    with open(EVENTS_FILE, "w") as f:
        json.dump(data, f, indent=2)

    return event
