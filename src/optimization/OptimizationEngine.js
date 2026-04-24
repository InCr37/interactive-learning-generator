/**
 * OptimizationEngine
 *
 * Core engine that reads learner profiles and generates micro-adjustments
 * for content generation. Rule-based adaptation (no ML dependencies).
 */

class OptimizationEngine {
  /**
   * Generate optimization directives for content generation
   * @param {Object} learnerProfile - Current learner profile
   * @param {Object} generationContext - Current content being generated
   * @returns {Object} Optimization directives
   */
  static generateDirectives(learnerProfile, generationContext = {}) {
    const aggregated = learnerProfile.aggregatedMetrics || {};
    const conceptMastery = learnerProfile.conceptMastery || {};
    const recentSessions = learnerProfile.sessionHistory?.slice(-5) || [];

    return {
      difficultyAdjustment: this.calculateDifficultyAdjustment(aggregated),
      hintFrequency: this.calculateHintFrequency(aggregated),
      conceptEmphasis: this.calculateConceptEmphasis(conceptMastery, generationContext),
      pacingAdjustment: this.calculatePacingAdjustment(aggregated, recentSessions),
      spiralPracticeConfig: this.calculateSpiralConfig(conceptMastery),
      quizDistribution: this.calculateQuizDistribution(aggregated),
      teachingStyle: this.calculateTeachingStyle(aggregated),
      languageAdjustment: this.calculateLanguageAdjustment(aggregated)
    };
  }

  /**
   * Quick check if a learner needs optimization
   * @param {Object} learnerProfile
   * @returns {boolean} True if optimizations should be applied
   */
  static needsOptimization(learnerProfile) {
    return (learnerProfile.sessionHistory?.length || 0) >= 1;
  }

  /**
   * Calculate performance trend over sessions
   * @param {Array} sessionHistory
   * @returns {Object} { trend: 'improving'|'stable'|'declining', delta: float }
   */
  static calculatePerformanceTrend(sessionHistory) {
    if (!sessionHistory || sessionHistory.length < 3) {
      return { trend: 'stable', delta: 0 };
    }

    const recent = sessionHistory.slice(-3);
    const older = sessionHistory.slice(-6, -3);

    if (older.length === 0) {
      return { trend: 'stable', delta: 0 };
    }

    const recentAvg = recent.reduce((sum, s) => sum + (s.metrics?.correctRate || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s.metrics?.correctRate || 0), 0) / older.length;

    const delta = recentAvg - olderAvg;

    if (delta > 0.1) return { trend: 'improving', delta };
    if (delta < -0.1) return { trend: 'declining', delta };
    return { trend: 'stable', delta };
  }

  /**
   * Calculate difficulty adjustment based on correctRate
   * @returns {Object} { direction: 'increase'|'decrease'|'maintain', multiplier: float }
   */
  static calculateDifficultyAdjustment(aggregatedMetrics) {
    const rate = aggregatedMetrics.overallCorrectRate || 0.65;

    if (rate > 0.85) {
      return { direction: 'increase', multiplier: 1.3, reason: 'High mastery - challenge more' };
    }
    if (rate > 0.75) {
      return { direction: 'increase', multiplier: 1.15, reason: 'Good mastery - slightly increase' };
    }
    if (rate < 0.4) {
      return { direction: 'decrease', multiplier: 0.7, reason: 'Struggling - reduce difficulty' };
    }
    if (rate < 0.55) {
      return { direction: 'decrease', multiplier: 0.85, reason: 'Below average - simplify' };
    }
    return { direction: 'maintain', multiplier: 1.0, reason: 'Optimal range' };
  }

  /**
   * Calculate hint frequency based on attempts
   * @returns {number} Recommended hint levels (1-3)
   */
  static calculateHintFrequency(aggregatedMetrics) {
    const avgAttempts = aggregatedMetrics.overallAvgAttempts || 1.5;

    if (avgAttempts > 2.5) {
      return { levels: 3, depth: 'detailed', reason: 'Needs extensive support' };
    }
    if (avgAttempts > 1.8) {
      return { levels: 2, depth: 'moderate', reason: 'Benefits from some hints' };
    }
    return { levels: 1, depth: 'minimal', reason: 'Understands quickly' };
  }

  /**
   * Identify concepts needing more emphasis based on mastery scores
   * @returns {Array} Concepts with low mastery scores
   */
  static calculateConceptEmphasis(conceptMastery, generationContext = {}) {
    const currentConcepts = generationContext.concepts || [];
    const emphasis = [];

    for (const concept of currentConcepts) {
      const term = concept.term || concept;
      const mastery = conceptMastery[term];

      if (!mastery || mastery.masteryScore < 0.6) {
        emphasis.push({
          concept: term,
          currentScore: mastery?.masteryScore || 0,
          priority: mastery ? 'high' : 'new',
          recommendation: mastery
            ? 'Add more practice problems and teaching modules'
            : 'Introduce with extra examples and analogies'
        });
      }
    }

    // Sort by lowest mastery first
    emphasis.sort((a, b) => a.currentScore - b.currentScore);

    return emphasis;
  }

  /**
   * Calculate pacing adjustment based on session duration vs expected
   * @returns {Object} { type: 'slower'|'maintain'|'faster', detail: string }
   */
  static calculatePacingAdjustment(aggregatedMetrics, recentSessions = []) {
    const expectedDuration = aggregatedMetrics.expectedSessionDuration || 900; // 15 min default
    const actualDuration = aggregatedMetrics.avgSessionDuration || 0;

    if (actualDuration === 0) {
      return { type: 'maintain', detail: 'No timing data yet' };
    }

    const ratio = actualDuration / expectedDuration;

    if (ratio > 1.5) {
      return { type: 'slower', detail: 'Take more time with concepts', chunksPerModule: 1.2 };
    }
    if (ratio > 1.2) {
      return { type: 'slower', detail: 'Slightly slower pacing recommended', chunksPerModule: 1.1 };
    }
    if (ratio < 0.5) {
      return { type: 'faster', detail: 'Accelerate - learner is advanced', chunksPerModule: 0.8 };
    }
    if (ratio < 0.8) {
      return { type: 'faster', detail: 'Slightly faster pacing OK', chunksPerModule: 0.9 };
    }

    return { type: 'maintain', detail: 'Pacing is appropriate', chunksPerModule: 1.0 };
  }

  /**
   * Calculate spiral practice configuration based on concept mastery
   * @returns {Object} Spiral practice optimization directives
   */
  static calculateSpiralConfig(conceptMastery) {
    const entries = Object.values(conceptMastery);
    const weakCount = entries.filter(c => c.masteryScore < 0.6).length;
    const strongCount = entries.filter(c => c.masteryScore >= 0.8).length;

    // Determine integration point based on weak vs strong concepts
    let integrationPoint;
    if (weakCount > 2) {
      integrationPoint = 3; // Delay combination - more single-concept practice
    } else if (weakCount > 0) {
      integrationPoint = 2; // Standard - combine after some mastery
    } else {
      integrationPoint = 1; // Early combination for advanced learners
    }

    return {
      integrationPoint,
      problemsPerLevel: weakCount > 1 ? 2 : 1,
      includeRemedialPractice: weakCount > 0,
      finalChallengeDifficulty: strongCount > weakCount ? 'advanced' : 'standard',
      reinforcementRounds: weakCount > 0 ? 2 : 1
    };
  }

  /**
   * Calculate quiz distribution based on learner performance
   * @returns {Object} Quiz optimization directives
   */
  static calculateQuizDistribution(aggregatedMetrics) {
    const correctRate = aggregatedMetrics.overallCorrectRate || 0.65;

    if (correctRate > 0.8) {
      return {
        basicRatio: 0.2,
        appliedRatio: 0.5,
        advancedRatio: 0.3,
        reason: 'Challenge with advanced problems'
      };
    }
    if (correctRate < 0.5) {
      return {
        basicRatio: 0.5,
        appliedRatio: 0.4,
        advancedRatio: 0.1,
        reason: 'Focus on foundation building'
      };
    }

    return {
      basicRatio: 0.3,
      appliedRatio: 0.5,
      advancedRatio: 0.2,
      reason: 'Balanced difficulty distribution'
    };
  }

  /**
   * Calculate teaching style based on learner performance
   * @returns {Object} Teaching style optimization directives
   */
  static calculateTeachingStyle(aggregatedMetrics) {
    const correctRate = aggregatedMetrics.overallCorrectRate || 0.65;

    if (correctRate < 0.55) {
      return {
        style: 'remedial',
        includeAnalogies: true,
        includeRemedialModules: true,
        chunkSize: 'smaller',
        languageSimplification: true,
        examplesPerConcept: 3,
        reason: 'Needs remedial support with extra examples'
      };
    }
    if (correctRate > 0.85) {
      return {
        style: 'advanced',
        includeAnalogies: false,
        includeRemedialModules: false,
        chunkSize: 'larger',
        languageSimplification: false,
        examplesPerConcept: 1,
        reason: 'Advanced learner - skip basic explanations'
      };
    }

    return {
      style: 'standard',
      includeAnalogies: true,
      includeRemedialModules: true,
      chunkSize: 'standard',
      languageSimplification: false,
      examplesPerConcept: 2,
      reason: 'Standard teaching style'
    };
  }

  /**
   * Calculate language adjustment based on learner level
   * @returns {Object} Language optimization directives
   */
  static calculateLanguageAdjustment(aggregatedMetrics) {
    const correctRate = aggregatedMetrics.overallCorrectRate || 0.65;

    if (correctRate < 0.5) {
      return {
        level: 'simplified',
        technicalTerminology: 'define-all',
        bilingualSupport: true,
        reason: 'Simplify language, define all terms'
      };
    }
    if (correctRate > 0.8) {
      return {
        level: 'technical',
        technicalTerminology: 'standard',
        bilingualSupport: false,
        reason: 'Advanced - use standard technical language'
      };
    }

    return {
      level: 'standard',
      technicalTerminology: 'define-key',
      bilingualSupport: false,
      reason: 'Standard language with key term definitions'
    };
  }

  /**
   * Generate directives for QuizGenerator
   * @param {Object} aggregatedMetrics
   * @param {Object} conceptMastery
   * @returns {Object} Quiz optimization directives
   */
  static generateQuizDirectives(aggregatedMetrics, conceptMastery = {}) {
    const difficulty = this.calculateDifficultyAdjustment(aggregatedMetrics);
    const hints = this.calculateHintFrequency(aggregatedMetrics);
    const distribution = this.calculateQuizDistribution(aggregatedMetrics);

    return {
      difficultyMultiplier: difficulty.multiplier,
      maxAttempts: aggregatedMetrics.overallAvgAttempts > 2 ? 4 : 3,
      hintLevels: hints.levels,
      hintDepth: hints.depth,
      questionTypeDistribution: distribution,
      conceptsToFocus: this.calculateConceptEmphasis(conceptMastery, {}).slice(0, 3)
    };
  }

  /**
   * Generate directives for TeachingFlowGenerator
   * @param {Object} learnerProfile
   * @returns {Object} Teaching flow optimization directives
   */
  static generateTeachingDirectives(learnerProfile) {
    const { aggregatedMetrics, conceptMastery } = learnerProfile;
    const style = this.calculateTeachingStyle(aggregatedMetrics);
    const pacing = this.calculatePacingAdjustment(aggregatedMetrics, learnerProfile.sessionHistory?.slice(-5));

    return {
      teachingStyle: style.style,
      includeAnalogies: style.includeAnalogies,
      includeRemedialModules: style.includeRemedialModules,
      chunkSize: style.chunkSize,
      languageSimplification: style.languageSimplification,
      examplesPerConcept: style.examplesPerConcept,
      pacingAdjustment: pacing,
      conceptEmphasis: this.calculateConceptEmphasis(conceptMastery, {})
    };
  }

  /**
   * Generate directives for SpiralPracticeGenerator
   * @param {Object} conceptMastery
   * @returns {Object} Spiral practice optimization directives
   */
  static generateSpiralDirectives(conceptMastery) {
    const config = this.calculateSpiralConfig(conceptMastery);
    const weakConcepts = Object.entries(conceptMastery)
      .filter(([_, v]) => v.masteryScore < 0.6)
      .map(([k]) => k);

    return {
      ...config,
      weakConcepts,
      strongConcepts: Object.entries(conceptMastery)
        .filter(([_, v]) => v.masteryScore >= 0.8)
        .map(([k]) => k)
    };
  }

  /**
   * Merge multiple directive sources into a consolidated set
   * @param {Array} directiveSets - Array of directive objects
   * @returns {Object} Merged directives
   */
  static mergeDirectives(...directiveSets) {
    const merged = {
      difficultyAdjustment: { multiplier: 1.0 },
      hintFrequency: { levels: 2 },
      conceptEmphasis: [],
      pacingAdjustment: { type: 'maintain' },
      spiralPracticeConfig: { integrationPoint: 2 },
      quizDistribution: { basicRatio: 0.3, appliedRatio: 0.5, advancedRatio: 0.2 },
      teachingStyle: { style: 'standard' },
      languageAdjustment: { level: 'standard' }
    };

    for (const directives of directiveSets) {
      if (!directives) continue;

      // Merge with priority to more aggressive adjustments (lower difficulty, more hints)
      if (directives.difficultyAdjustment?.multiplier < merged.difficultyAdjustment.multiplier) {
        merged.difficultyAdjustment = directives.difficultyAdjustment;
      }
      if ((directives.hintFrequency?.levels || 0) > merged.hintFrequency.levels) {
        merged.hintFrequency = directives.hintFrequency;
      }
      if (directives.conceptEmphasis?.length > 0) {
        merged.conceptEmphasis = [...merged.conceptEmphasis, ...directives.conceptEmphasis];
      }
      if (directives.pacingAdjustment?.type === 'slower') {
        merged.pacingAdjustment = directives.pacingAdjustment;
      }
      if (directives.spiralPracticeConfig) {
        merged.spiralPracticeConfig = directives.spiralPracticeConfig;
      }
      if (directives.quizDistribution) {
        merged.quizDistribution = directives.quizDistribution;
      }
      if (directives.teachingStyle) {
        merged.teachingStyle = directives.teachingStyle;
      }
      if (directives.languageAdjustment) {
        merged.languageAdjustment = directives.languageAdjustment;
      }
    }

    return merged;
  }
}

module.exports = OptimizationEngine;