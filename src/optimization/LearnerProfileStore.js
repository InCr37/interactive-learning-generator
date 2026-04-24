/**
 * LearnerProfileStore
 *
 * Persistent file-based storage for learner profiles and historical performance.
 * One JSON file per learner in ~/.claude/skills/interactive-learning-generator/data/profiles/
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class LearnerProfileStore {
  constructor(dataDir = null) {
    // Default: ~/.claude/skills/interactive-learning-generator/data/profiles/
    const homeDir = os.homedir();
    this.baseDir = dataDir || path.join(homeDir, '.claude', 'skills', 'interactive-learning-generator', 'data', 'profiles');
    this.profilesDir = this.baseDir;
  }

  /**
   * Ensure the profiles directory exists
   */
  async ensureDir() {
    await fs.mkdir(this.profilesDir, { recursive: true });
  }

  /**
   * Get the file path for a learner profile
   */
  getProfilePath(learnerId) {
    return path.join(this.profilesDir, `${learnerId}.json`);
  }

  /**
   * Get or create a learner profile
   * @param {string} learnerId
   * @returns {Promise<Object>} Learner profile
   */
  async getProfile(learnerId) {
    await this.ensureDir();
    const filePath = this.getProfilePath(learnerId);

    try {
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Profile doesn't exist - create new one
        const newProfile = this.createEmptyProfile(learnerId);
        await this.saveProfile(newProfile);
        return newProfile;
      }
      throw error;
    }
  }

  /**
   * Create a new empty profile
   */
  createEmptyProfile(learnerId) {
    return {
      learnerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessionHistory: [],
      aggregatedMetrics: {
        totalSessions: 0,
        overallCorrectRate: 0,
        overallAvgAttempts: 0,
        strongestConcepts: [],
        weakestConcepts: [],
        preferredDifficulty: 'applied',
        avgSessionDuration: 0
      },
      conceptMastery: {}
    };
  }

  /**
   * Save a learner profile to disk
   */
  async saveProfile(profile) {
    await this.ensureDir();
    profile.updatedAt = new Date().toISOString();
    const filePath = this.getProfilePath(profile.learnerId);
    await fs.writeFile(filePath, JSON.stringify(profile, null, 2), 'utf8');
  }

  /**
   * Update learner profile with new session data
   * @param {string} learnerId
   * @param {Object} sessionAnalytics - Analytics from SessionAnalyticsCollector
   */
  async updateProfile(learnerId, sessionAnalytics) {
    const profile = await this.getProfile(learnerId);

    // Add session to history
    profile.sessionHistory.push({
      sessionId: sessionAnalytics.sessionId,
      date: sessionAnalytics.collectedAt,
      contentHash: sessionAnalytics.contentHash || null,
      metrics: sessionAnalytics.performanceMetrics,
      conceptPerformance: sessionAnalytics.conceptEngagement
    });

    // Keep only last 50 sessions to limit file growth
    if (profile.sessionHistory.length > 50) {
      profile.sessionHistory = profile.sessionHistory.slice(-50);
    }

    // Recalculate aggregated metrics
    this.recalculateAggregatedMetrics(profile);

    // Update concept mastery scores
    this.updateConceptMastery(profile, sessionAnalytics);

    await this.saveProfile(profile);
    return profile;
  }

  /**
   * Recalculate aggregated metrics from session history
   */
  recalculateAggregatedMetrics(profile) {
    const history = profile.sessionHistory;
    if (history.length === 0) return;

    const totalSessions = history.length;

    // Calculate overall correct rate
    let totalCorrect = 0;
    let totalAttempts = 0;
    let totalDuration = 0;

    for (const session of history) {
      totalCorrect += (session.metrics?.correctRate || 0) * (session.metrics?.totalQuestions || 1);
      totalAttempts += session.metrics?.totalQuestions || 1;
      totalDuration += session.metrics?.totalTime || 0;
    }

    profile.aggregatedMetrics.totalSessions = totalSessions;
    profile.aggregatedMetrics.overallCorrectRate = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
    profile.aggregatedMetrics.overallAvgAttempts = totalAttempts / totalSessions;
    profile.aggregatedMetrics.avgSessionDuration = totalDuration / totalSessions;

    // Determine preferred difficulty based on recent performance
    const recentCorrectRate = history.slice(-5).reduce((sum, s) => sum + (s.metrics?.correctRate || 0), 0) / Math.min(5, history.length);
    if (recentCorrectRate > 0.8) {
      profile.aggregatedMetrics.preferredDifficulty = 'advanced';
    } else if (recentCorrectRate < 0.5) {
      profile.aggregatedMetrics.preferredDifficulty = 'basic';
    } else {
      profile.aggregatedMetrics.preferredDifficulty = 'applied';
    }

    // Find strongest and weakest concepts
    this.updateStrongestWeakestConcepts(profile);
  }

  /**
   * Update strongest and weakest concepts based on performance
   */
  updateStrongestWeakestConcepts(profile) {
    const conceptScores = {};

    for (const session of profile.sessionHistory) {
      for (const [concept, perf] of Object.entries(session.conceptPerformance || {})) {
        if (!conceptScores[concept]) {
          conceptScores[concept] = { total: 0, count: 0 };
        }
        conceptScores[concept].total += perf.correct || 0;
        conceptScores[concept].count += perf.attempts || 1;
      }
    }

    const conceptAverages = Object.entries(conceptScores).map(([concept, scores]) => ({
      concept,
      average: scores.total / scores.count
    }));

    conceptAverages.sort((a, b) => b.average - a.average);

    profile.aggregatedMetrics.strongestConcepts = conceptAverages.slice(0, 3).map(c => c.concept);
    profile.aggregatedMetrics.weakestConcepts = conceptAverages.slice(-3).map(c => c.concept);
  }

  /**
   * Update concept mastery scores using exponential moving average
   */
  updateConceptMastery(profile, sessionAnalytics) {
    const alpha = 0.3; // Smoothing factor - recent results weight more

    for (const [concept, perf] of Object.entries(sessionAnalytics.conceptEngagement || {})) {
      const attempts = perf.attempts || 1;
      const correct = perf.correct || 0;
      const sessionScore = correct / attempts;

      if (profile.conceptMastery[concept]) {
        // Update existing concept with exponential moving average
        const existing = profile.conceptMastery[concept];
        profile.conceptMastery[concept] = {
          masteryScore: alpha * sessionScore + (1 - alpha) * existing.masteryScore,
          lastPracticed: new Date().toISOString(),
          confidence: this.scoreToConfidence(profile.conceptMastery[concept].masteryScore)
        };
      } else {
        // New concept
        profile.conceptMastery[concept] = {
          masteryScore: sessionScore,
          lastPracticed: new Date().toISOString(),
          confidence: this.scoreToConfidence(sessionScore)
        };
      }
    }
  }

  /**
   * Convert mastery score to confidence level
   */
  scoreToConfidence(score) {
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Get aggregated performance across all sessions
   * @param {string} learnerId
   * @returns {Promise<Object>} Aggregated metrics
   */
  async getAggregatedMetrics(learnerId) {
    const profile = await this.getProfile(learnerId);
    return profile.aggregatedMetrics;
  }

  /**
   * Get concept-level mastery scores
   * @param {string} learnerId
   * @returns {Promise<Object>} Concept mastery map
   */
  async getConceptMastery(learnerId) {
    const profile = await this.getProfile(learnerId);
    return profile.conceptMastery;
  }

  /**
   * Get performance trend over sessions
   * @param {string} learnerId
   * @returns {Promise<Object>} { trend: 'improving'|'stable'|'declining', delta: float }
   */
  async getPerformanceTrend(learnerId) {
    const profile = await this.getProfile(learnerId);
    const history = profile.sessionHistory;

    if (history.length < 3) {
      return { trend: 'stable', delta: 0 };
    }

    const recent = history.slice(-3);
    const older = history.slice(-6, -3);

    const recentAvg = recent.reduce((sum, s) => sum + (s.metrics?.correctRate || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + (s.metrics?.correctRate || 0), 0) / older.length;

    const delta = recentAvg - olderAvg;

    if (delta > 0.1) return { trend: 'improving', delta };
    if (delta < -0.1) return { trend: 'declining', delta };
    return { trend: 'stable', delta };
  }

  /**
   * Delete a learner profile (for testing/reset)
   */
  async deleteProfile(learnerId) {
    const filePath = this.getProfilePath(learnerId);
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }

  /**
   * List all learner IDs with profiles
   */
  async listLearners() {
    await this.ensureDir();
    const files = await fs.readdir(this.profilesDir);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));
  }
}

module.exports = LearnerProfileStore;