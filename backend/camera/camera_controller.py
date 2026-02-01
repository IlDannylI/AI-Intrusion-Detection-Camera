import cv2


class CameraController:
    def __init__(self, device_index=0):
        self.cap = cv2.VideoCapture(device_index)

        if not self.cap.isOpened():
            raise RuntimeError("Camera / capture card not accessible")

    def get_frame(self):
        ret, frame = self.cap.read()
        if not ret:
            raise RuntimeError("Failed to grab frame")
        return frame

    def stop(self):
        if self.cap:
            self.cap.release()
