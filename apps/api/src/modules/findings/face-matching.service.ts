import { Injectable } from '@nestjs/common';

export interface FaceReferencePayload {
  normalizedVector: number[];
  metadata?: Record<string, unknown>;
}

export interface CandidatePayload {
  url: string;
  platform: string;
  sourceType: string;
  normalizedVector?: number[];
}

export interface FaceMatchingResult {
  matchScore: number;
  confidenceScore: number;
  explanation: string;
}

@Injectable()
export class FaceMatchingService {
  scoreCandidate(reference: FaceReferencePayload, candidate: CandidatePayload): FaceMatchingResult {
    const base = Math.min(100, Math.max(0, reference.normalizedVector.reduce((sum, value) => sum + value, 0) % 101));
    const urlFactor = Math.min(50, candidate.url.length % 51);
    const matchScore = Math.round((base + urlFactor) / 1.5);
    const confidenceScore = Math.max(50, Math.min(100, Math.round(matchScore * 0.95)));

    return {
      matchScore,
      confidenceScore,
      explanation: 'Simulated face matching result. Replace with AI matching engine in phase 2.'
    };
  }
}
