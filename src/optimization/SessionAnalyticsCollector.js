/**
 * SessionAnalyticsCollector
 *
 * Extracts and normalizes performance metrics from a completed learning session.
 * Designed to work with the skill's JSON output structure.
 */

class SessionAnalyticsCollector {
  /**
   * Collect analytics from a completed session
   * @param {Object} sessionResult - The result from generateInteractiveLearning()
   * @param {Object} learnerResponse - Optional: learner interactions during the session
   * @returns {Object} Normalized session analytics
   */
  static collect(sessionResult, learnerResponse = {}) {
    const sessionId = sessionResult.sessionId || `session-${Date.now()}`;

    return {
      sessionId,
      collectedAt: new Date().toISOString(),
      contentHash: this.hashContent(sessionResult.design),
      contentMetrics: this.extractContentMetrics(sessionResult.design),
      performanceMetrics: this.extractPerformanceMetrics(learnerResponse, sessionResult.design),
      errorPatterns: this.identifyErrorPatterns(learnerResponse, sessionResult.design),
      timeMetrics: this.extractTimeMetrics(learnerResponse),
      conceptEngagement: this.calculateConceptEngagement(sessionResult.design, learnerResponse)
    };
  }

  /**
   * Simple hash of content for caching/comparison
   */
  static hashContent(design) {
    if (!design || !design.content) return null;
    const str = JSON.stringify(design.content);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  /**
   * Extract content metrics from the design
   */
  static extractContentMetrics(design) {
    const modules = design?.content?.modules || design?.interactiveModules || [];
    const concepts = design?.content?.concepts || [];
    const quizzes = modules.filter(m => m.type === 'quiz' || m.quiz);

    return {
      totalModules: modules.length,
      totalConcepts: concepts.length,
      totalQuizzes: quizzes.length,
      estimatedTime: modules.reduce((sum, m) => sum + (m.estimatedTime || 0), 0),
      difficultyDistribution: this.getDifficultyDistribution(modules)
    };
  }

  /**
   * Get difficulty distribution of modules
   */
  static getDifficultyDistribution(modules) {
    const dist = { basic: 0, applied: 0, advanced: 0 };
    for (const m of modules) {
      const diff = m.difficulty || m.quiz?.difficulty || 'applied';
      if (diff <= 3) dist.basic++;
      else if (diff <= 6) dist.applied++;
      else dist.advanced++;
    }
    return dist;
  }

  /**
   * Extract performance metrics from learner response
   */
  static extractPerformanceMetrics(learnerResponse, design) {
    // If learner response provided actual answers, use those
    if (learnerResponse.answers && Array.isArray(learnerResponse.answers)) {
      return this.calculateFromAnswers(learnerResponse.answers);
    }

    // Otherwise, calculate from design metadata (for post-session update)
    // This is a fallback when we only have the generated content
    return this.calculateFromDesign(design);
  }

  /**
   * Calculate metrics from actual learner answers
   */
  static calculateFromAnswers(answers) {
    const total = answers.length;
    const correct = answers.filter(a => a.isCorrect).length;
    const totalAttempts = answers.reduce((sum, a) => sum + (a.attempts || 1), 0);

    return {
      totalQuestions: total,
      correctCount: correct,
      incorrectCount: total - correct,
      correctRate: total > 0 ? correct / total : 0,
      avgAttempts: total > 0 ? totalAttempts / total : 0,
      perfectScores: answers.filter(a => a.attempts === 1 && a.isCorrect).length,
      struggledQuestions: answers.filter(a => a.attempts > 2).length
    };
  }

  /**
   * Calculate metrics from design (before actual answers)
   */
  static calculateFromDesign(design) {
    const modules = design?.content?.modules || design?.interactiveModules || [];
    const quizzes = modules.filter(m => m.type === 'quiz' || m.quiz);
    const totalQuestions = quizzes.reduce((sum, q) => sum + 1, 0);

    return {
      totalQuestions,
      correctCount: 0,
      incorrectCount: 0,
      correctRate: 0,
      avgAttempts: 0,
      perfectScores: 0,
      struggledQuestions: 0,
      note: 'Metrics will be updated after session completion with actual learner responses'
    };
  }

  /**
   * Identify error patterns from learner responses
   */
  static identifyErrorPatterns(learnerResponse, design) {
    const patterns = [];

    if (!learnerResponse.answers || !Array.isArray(learnerResponse.answers)) {
      return patterns;
    }

    // Identify repeated misconception types
    const misconceptions = {};
    for (const answer of learnerResponse.answers) {
      if (!answer.isCorrect && answer.misconceptionType) {
        misconceptions[answer.misconceptionType] = (misconceptions[answer.misconceptionType] || 0) + 1;
      }
    }

    for (const [type, count] of Object.entries(misconceptions)) {
      patterns.push({
        type: 'misconception',
        category: type,
        frequency: count,
        severity: count > 2 ? 'high' : 'medium'
      });
    }

    // Identify concepts with repeated failures
    const conceptFailures = {};
    for (const answer of learnerResponse.answers) {
      if (!answer.isCorrect && answer.conceptId) {
        conceptFailures[answer.conceptId] = (conceptFailures[answer.conceptId] || 0) + 1;
      }
    }

    for (const [conceptId, count] of Object.entries(conceptFailures)) {
      if (count >= 2) {
        patterns.push({
          type: 'concept-struggle',
          conceptId,
          frequency: count,
          severity: count > 2 ? 'high' : 'medium'
        });
      }
    }

    return patterns;
  }

  /**
   * Extract timing metrics
   */
  static extractTimeMetrics(learnerResponse) {
    if (learnerResponse.timing) {
      return {
        totalTime: learnerResponse.timing.total || 0,
        avgTimePerModule: learnerResponse.timing.avgPerModule || 0,
        timeOnQuizzes: learnerResponse.timing.quizzes || 0,
        timeOnTeaching: learnerResponse.timing.teaching || 0
      };
    }

    return {
      totalTime: 0,
      avgTimePerModule: 0,
      timeOnQuizzes: 0,
      timeOnTeaching: 0
    };
  }

  /**
   * Calculate concept engagement based on quiz performance
   */
  static calculateConceptEngagement(design, learnerResponse) {
    const engagement = {};

    // Get concepts from design
    const concepts = design?.content?.concepts || [];
    const modules = design?.content?.modules || design?.interactiveModules || [];

    // Map concepts to their associated quizzes
    for (const concept of concepts) {
      const term = concept.term || concept.id || 'unknown';
      engagement[term] = { attempts: 0, correct: 0, avgTime: 0 };
    }

    // If we have actual answers, use those
    if (learnerResponse.answers && Array.isArray(learnerResponse.answers)) {
      for (const answer of learnerResponse.answers) {
        if (answer.conceptId && engagement[answer.conceptId] !== undefined) {
          engagement[answer.conceptId].attempts += (answer.attempts || 1);
          engagement[answer.conceptId].correct += answer.isCorrect ? 1 : 0;
          engagement[answer.conceptId].avgTime += (answer.timeSpent || 0);
        }
      }
    }

    // Calculate averages
    for (const concept of Object.keys(engagement)) {
      if (engagement[concept].attempts > 0) {
        engagement[concept].avgTime /= engagement[concept].attempts;
      }
    }

    return engagement;
  }

  /**
   * Calculate performance trend for a series of sessions
   */
  static calculateSessionTrend(sessionHistory) {
    if (sessionHistory.length < 2) {
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
}

module.exports = SessionAnalyticsCollector;