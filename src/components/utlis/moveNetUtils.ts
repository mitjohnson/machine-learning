/**
 * @license
 * Copyright 2023 Google LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import * as posedetection from '@tensorflow-models/pose-detection';

interface ModelConfig {
  scoreThreshold: number;
  enableTracking: boolean;
}

interface State {
  model: posedetection.SupportedModels;
  modelConfig: ModelConfig;
}

export const STATE: State = {
  model: posedetection.SupportedModels.MoveNet,
  modelConfig: {
    scoreThreshold: 0.5,
    enableTracking: false,
  },
};

export const drawKeypoints = (
  keypoints: posedetection.Keypoint[],
  ctx: CanvasRenderingContext2D
) => {
  ctx.fillStyle = 'Red';
  ctx.strokeStyle = 'White';
  ctx.lineWidth = 2;

  keypoints.forEach((keypoint) => {
    if (keypoint.score) {
      if (keypoint.score > 0.5) {
        // Only draw keypoints with a score above the threshold
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
  });
};

export const drawSkeleton = (
  keypoints: posedetection.Keypoint[],
  ctx: CanvasRenderingContext2D
) => {
  const color = 'White'; // You can customize this color if needed
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  posedetection.util.getAdjacentPairs(STATE.model).forEach(([i, j]) => {
    const kp1 = keypoints[i];
    const kp2 = keypoints[j];

    // If score is null, just show the keypoint.
    const score1 = kp1.score != null ? kp1.score : 1;
    const score2 = kp2.score != null ? kp2.score : 1;
    const scoreThreshold = STATE.modelConfig.scoreThreshold || 0;

    if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.stroke();
    }
  });
};
