
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface EmotionAnalysis {
  id: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  trustPercentage: number;
  emotions: {
    happiness: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    neutral: number;
  };
  frameImages: string[];
  videoPath: string;
}

export interface TrainingData {
  id: string;
  userId: string;
  label: 'trustworthy' | 'untrustworthy';
  imageData: string;
  emotions: number[];
  createdAt: Date;
}

export interface MLModel {
  id: string;
  userId: string;
  name: string;
  accuracy: number;
  trainingData: number;
  createdAt: Date;
  modelData: any;
}
