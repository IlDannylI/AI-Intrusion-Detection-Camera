from pathlib import Path
import cv2
import numpy as np


class PersonDetector:
    """
    MobileNet-SSD (Caffe) via OpenCV DNN.
    Detects COCO/VOC-style classes; for this model, "person" is class_id = 15 in VOC.
    """

    # VOC class labels for the common MobileNet-SSD Caffe model
    # (index 15 is 'person')
    CLASSES = [
        "background", "aeroplane", "bicycle", "bird", "boat",
        "bottle", "bus", "car", "cat", "chair", "cow", "diningtable",
        "dog", "horse", "motorbike", "person", "pottedplant",
        "sheep", "sofa", "train", "tvmonitor"
    ]

    PERSON_CLASS_ID = 15

    def __init__(
        self,
        prototxt_path="backend/ml/models/MobileNetSSD_deploy.prototxt",
        model_path="backend/ml/models/MobileNetSSD_deploy.caffemodel",
        conf_threshold=0.45,
        input_size=(300, 300),
    ):
        self.prototxt = Path(prototxt_path)
        self.model = Path(model_path)

        if not self.prototxt.exists():
            raise FileNotFoundError(f"Missing prototxt: {self.prototxt}")
        if not self.model.exists():
            raise FileNotFoundError(f"Missing caffemodel: {self.model}")

        self.conf_threshold = float(conf_threshold)
        self.input_size = input_size

        self.net = cv2.dnn.readNetFromCaffe(str(self.prototxt), str(self.model))

    def detect_people(self, frame_bgr):
        """
        Returns a list of detections: [(x1,y1,x2,y2,conf), ...] for 'person' only.
        """
        (h, w) = frame_bgr.shape[:2]

        blob = cv2.dnn.blobFromImage(
            frame_bgr,
            scalefactor=0.007843,      # 1/127.5
            size=self.input_size,      # 300x300
            mean=(127.5, 127.5, 127.5),
            swapRB=False,
            crop=False
        )

        self.net.setInput(blob)
        detections = self.net.forward()

        people = []
        # detections shape: [1, 1, N, 7] -> [batch, _, idx, (class, conf, x1,y1,x2,y2)]
        for i in range(detections.shape[2]):
            conf = float(detections[0, 0, i, 2])
            if conf < self.conf_threshold:
                continue

            class_id = int(detections[0, 0, i, 1])
            if class_id != self.PERSON_CLASS_ID:
                continue

            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
            (x1, y1, x2, y2) = box.astype("int")

            # clamp
            x1 = max(0, min(x1, w - 1))
            y1 = max(0, min(y1, h - 1))
            x2 = max(0, min(x2, w - 1))
            y2 = max(0, min(y2, h - 1))

            if x2 > x1 and y2 > y1:
                people.append((x1, y1, x2, y2, conf))

        return people
import cv2
import os
import numpy as np

class PersonDetector:
    def __init__(self, confidence_threshold=0.5):
        base = os.path.dirname(__file__)
        model_dir = os.path.join(base, "models")

        self.net = cv2.dnn.readNetFromCaffe(
            os.path.join(model_dir, "MobileNetSSD_deploy.prototxt"),
            os.path.join(model_dir, "MobileNetSSD_deploy.caffemodel")
        )

        # MobileNet-SSD class labels
        self.CLASSES = [
            "background", "aeroplane", "bicycle", "bird", "boat",
            "bottle", "bus", "car", "cat", "chair",
            "cow", "diningtable", "dog", "horse", "motorbike",
            "person", "pottedplant", "sheep", "sofa",
            "train", "tvmonitor"
        ]

        self.person_class_id = self.CLASSES.index("person")
        self.confidence_threshold = confidence_threshold

    def detect(self, frame):
        """
        Returns:
          detected (bool)
          boxes (list of (x1, y1, x2, y2, confidence))
        """
        (h, w) = frame.shape[:2]

        blob = cv2.dnn.blobFromImage(
            cv2.resize(frame, (300, 300)),
            0.007843,
            (300, 300),
            127.5
        )

        self.net.setInput(blob)
        detections = self.net.forward()

        boxes = []

        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            class_id = int(detections[0, 0, i, 1])

            if confidence > self.confidence_threshold and class_id == self.person_class_id:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (x1, y1, x2, y2) = box.astype("int")
                boxes.append((x1, y1, x2, y2, confidence))

        return len(boxes) > 0, boxes
