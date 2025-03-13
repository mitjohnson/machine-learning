import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as pose from '@tensorflow-models/pose-detection';
import React, { useRef, useEffect, useState } from 'react';
import { drawKeypoints, drawSkeleton } from './utlis/moveNetUtils';

export const BodyTracker: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<pose.PoseDetector | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      await tf.setBackend('webgl');
      const model = await pose.createDetector(pose.SupportedModels.MoveNet);
      setDetector(model);
    };
    loadModel();
  }, []);

  const drawCanvas = (
    videoWidth: number,
    videoHeight: number,
    detectedPoses: pose.Pose[]
  ) => {
    const canvas = canvasRef.current;

    if (canvas) {
      const ctx = canvas.getContext('2d');

      if (ctx) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;

        ctx.clearRect(0, 0, videoWidth, videoHeight);

        detectedPoses.forEach((pose) => {
          drawKeypoints(pose.keypoints, ctx);
          drawSkeleton(pose.keypoints, ctx);
        });
      }
    }
  };

  useEffect(() => {
    const detectPose = async () => {
      if (
        detector &&
        webcamRef.current &&
        webcamRef.current.video &&
        webcamRef.current.video.readyState === 4
      ) {
        const video = webcamRef.current.video;
        webcamRef.current.video.width = webcamRef.current.video.videoWidth;
        webcamRef.current.video.height = webcamRef.current.video.videoHeight;
        const detectedPoses = await detector.estimatePoses(video);
        drawCanvas(video.videoWidth, video.videoHeight, detectedPoses);
      }
    };

    const interval = setInterval(() => {
      detectPose();
    }, 100);

    return () => clearInterval(interval);
  }, [detector]);

  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{
          width: 1280,
          height: 720,
          position: 'absolute',
          left: 0,
          right: 0,
          marginLeft: 'auto',
          marginRight: 'auto',
          alignContent: 'center',
        }}
        videoConstraints={{
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          width: 1280,
          height: 720,
          left: 0,
          right: 0,
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          alignContent: 'center',
        }}
      />
    </div>
  );
};
