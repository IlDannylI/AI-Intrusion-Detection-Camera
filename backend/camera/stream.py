import cv2
import time
import os
from datetime import datetime

from backend.ml.person_detector import PersonDetector
from backend.events.event_logger import log_event

# =============================
# CONFIG
# =============================
MIN_MOTION_AREA = 800
MOTION_COOLDOWN = 3  # seconds
SNAPSHOT_DIR = "backend/snapshots"

os.makedirs(SNAPSHOT_DIR, exist_ok=True)

# =============================
# INIT
# =============================
camera = cv2.VideoCapture(0)
person_detector = PersonDetector(confidence_threshold=0.5)

first_frame = None
last_event_time = 0

# =============================
# HELPERS
# =============================
def save_snapshot(frame):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"motion_{timestamp}.jpg"
    path = os.path.join(SNAPSHOT_DIR, filename)
    cv2.imwrite(path, frame)
    return filename


# =============================
# STREAM GENERATOR
# =============================
def generate_frames():
    global first_frame, last_event_time

    while True:
        success, frame = camera.read()
        if not success:
            break

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        # Initialize background
        if first_frame is None:
            first_frame = gray
            continue

        # Motion detection
        frame_delta = cv2.absdiff(first_frame, gray)
        thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
        thresh = cv2.dilate(thresh, None, iterations=2)

        contours, _ = cv2.findContours(
            thresh.copy(),
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        motion_detected = False
        motion_area = 0

        for contour in contours:
            area = cv2.contourArea(contour)
            if area < MIN_MOTION_AREA:
                continue
            motion_detected = True
            motion_area = max(motion_area, area)

        boxes = []

        # =============================
        # ML PERSON DETECTION
        # =============================
        if motion_detected:
            now = time.time()

            if now - last_event_time >= MOTION_COOLDOWN:
                person_detected, boxes = person_detector.detect(frame)

                if person_detected:
                    snapshot = save_snapshot(frame)

                    log_event(
                        event_type="intrusion",
                        snapshot=snapshot,
                        metadata={
                            "people": len(boxes),
                            "motion_area": motion_area
                        }
                    )

                    last_event_time = now

        # =============================
        # DRAW BOXES
        # =============================
        for (x1, y1, x2, y2, conf) in boxes:
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(
                frame,
                f"PERSON {conf:.2f}",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2
            )

        # =============================
        # STREAM FRAME
        # =============================
        ret, buffer = cv2.imencode(".jpg", frame)
        frame = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        )
