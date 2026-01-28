import platform

if platform.system() == "Linux":
    from picamera2 import Picamera2

    class CameraController:
        def __init__(self, resolution=(1280, 720), fps=30):
            self.picam2 = Picamera2()
            self.picam2.configure(
                self.picam2.create_video_configuration(
                    main={"size": resolution, "format": "RGB888"}
                )
            )
            self.picam2.start()

        def get_frame(self):
            return self.picam2.capture_array()

        def stop(self):
            self.picam2.stop()

else:
    from .mock_camera import MockCameraController as CameraController
