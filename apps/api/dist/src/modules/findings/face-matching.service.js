"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaceMatchingService = void 0;
const common_1 = require("@nestjs/common");
let FaceMatchingService = class FaceMatchingService {
    scoreCandidate(reference, candidate) {
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
};
exports.FaceMatchingService = FaceMatchingService;
exports.FaceMatchingService = FaceMatchingService = __decorate([
    (0, common_1.Injectable)()
], FaceMatchingService);
//# sourceMappingURL=face-matching.service.js.map