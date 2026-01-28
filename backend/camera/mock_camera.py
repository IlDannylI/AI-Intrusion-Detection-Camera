import cv2
import numpy as np


class MockCameraController:
    def __init__(self, resolution=(1280, 720)):
        self.resolution = resolution
        self.cap = cv2.VideoCapture(0)

        if not self.cap.isOpened():
            self.cap = None

    def get_frame(self):
        if self.cap:
            ret, frame = self.cap.read()
            if ret:
                return frame

        frame = np.zeros(
            (self.resolution[1], self.resolution[0], 3),
            dtype=np.uint8
        )

        cv2.putText(
            frame,
            "MOCK CAMERA (NO HARDWARE)",
            (50, 100),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 255),
            2,
            cv2.LINE_AA
        )

        return frame

    def stop(self):
        if self.cap:
            self.cap.release()
