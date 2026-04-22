/**
 * 教学设计原则应用器
 * 
 * 将渐进式揭露、情境化叙事、建设性失败反馈等教学设计原则映射到学习设计。
 * 基于概念分析和难度评估，制定教学策略。
 */

const designPrinciples = require('../utils/designPrinciples');

class DesignPrincipleApplier {
  /**
   * 应用教学设计原则
   * @param {Array} concepts - 概念数组
   * @param {Array} learningObjectives - 学习目标数组
   * @param {Object} difficultyAssessment - 难度评估结果
   * @param {Object} options - 应用选项
   * @returns {Promise<Object>} 教学设计原则应用结果
   */
  static async apply(concepts, learningObjectives, difficultyAssessment, options = {}) {
    console.log('应用教学设计原则');
    
    const targetAudience = options.targetAudience || 'student';
    const neutralInterface = options.neutralInterface !== false; // 默认使用中性界面
    
    // 根据受众选择原则优先级
    const principlePriorities = this.getPrinciplePriorities(targetAudience);
    
    // 应用原则
    const appliedPrinciples = [];
    const designStrategies = [];
    
    // 1. 渐进式揭露（Progressive Disclosure）
    if (principlePriorities.includes('progressive-disclosure')) {
      const progressiveStrategy = designPrinciples.applyProgressiveDisclosure(
        concepts, 
        difficultyAssessment.overallDifficulty
      );
      if (progressiveStrategy) {
        appliedPrinciples.push('progressive-disclosure');
        designStrategies.push(progressiveStrategy);
      }
    }
    
    // 2. 情境化叙事（Contextual Narrative）
    if (principlePriorities.includes('contextual-narrative')) {
      const narrativeStrategy = designPrinciples.applyContextualNarrative(
        concepts,
        learningObjectives,
        { neutral: neutralInterface }
      );
      if (narrativeStrategy) {
        appliedPrinciples.push('contextual-narrative');
        designStrategies.push(narrativeStrategy);
      }
    }
    
    // 3. 建设性失败反馈（Constructive Failure）
    if (principlePriorities.includes('constructive-failure')) {
      const failureStrategy = designPrinciples.applyConstructiveFailure(
        concepts,
        difficultyAssessment.potentialChallenges
      );
      if (failureStrategy) {
        appliedPrinciples.push('constructive-failure');
        designStrategies.push(failureStrategy);
      }
    }
    
    // 4. 无缝教学流（Seamless Teaching Flow）
    if (principlePriorities.includes('seamless-flow')) {
      const flowStrategy = designPrinciples.applySeamlessFlow(
        concepts.length,
        difficultyAssessment.overallDifficulty
      );
      if (flowStrategy) {
        appliedPrinciples.push('seamless-flow');
        designStrategies.push(flowStrategy);
      }
    }

    // 5. 高频提问（High Frequency Questioning）
    if (principlePriorities.includes('high-frequency-questioning')) {
      const questioningStrategy = designPrinciples.applyHighFrequencyQuestioning(
        concepts,
        difficultyAssessment
      );
      if (questioningStrategy) {
        appliedPrinciples.push('high-frequency-questioning');
        designStrategies.push(questioningStrategy);
      }
    }

    // 6. 解题机会（Problem Solving Opportunities）
    if (principlePriorities.includes('problem-solving-opportunities')) {
      const problemSolvingStrategy = designPrinciples.applyProblemSolvingOpportunities(
        concepts,
        difficultyAssessment.potentialChallenges
      );
      if (problemSolvingStrategy) {
        appliedPrinciples.push('problem-solving-opportunities');
        designStrategies.push(problemSolvingStrategy);
      }
    }

    // 7. 难度分级（Difficulty Scaffolding）
    if (principlePriorities.includes('difficulty-scaffolding')) {
      const scaffoldingStrategy = designPrinciples.applyDifficultyScaffolding(
        concepts,
        difficultyAssessment
      );
      if (scaffoldingStrategy) {
        appliedPrinciples.push('difficulty-scaffolding');
        designStrategies.push(scaffoldingStrategy);
      }
    }

    // 8. 智能调整（Adaptive Adjustment）
    if (principlePriorities.includes('adaptive-adjustment')) {
      const adaptiveStrategy = designPrinciples.applyAdaptiveAdjustment(
        concepts,
        difficultyAssessment
      );
      if (adaptiveStrategy) {
        appliedPrinciples.push('adaptive-adjustment');
        designStrategies.push(adaptiveStrategy);
      }
    }
    
    return {
      appliedPrinciples,
      designStrategies,
      audience: targetAudience,
      interfaceStyle: neutralInterface ? 'neutral-educational' : 'default',
      recommendations: this.generateDesignRecommendations(appliedPrinciples, difficultyAssessment)
    };
  }
  
  /**
   * 根据目标受众获取原则优先级
   */
  static getPrinciplePriorities(audience) {
    const priorities = {
      'student': ['progressive-disclosure', 'contextual-narrative', 'constructive-failure', 'seamless-flow', 'high-frequency-questioning', 'problem-solving-opportunities', 'difficulty-scaffolding', 'adaptive-adjustment'],
      'self-learner': ['contextual-narrative', 'constructive-failure', 'progressive-disclosure', 'seamless-flow', 'high-frequency-questioning', 'problem-solving-opportunities', 'difficulty-scaffolding', 'adaptive-adjustment'],
      'professional': ['contextual-narrative', 'seamless-flow', 'progressive-disclosure', 'constructive-failure', 'high-frequency-questioning', 'problem-solving-opportunities', 'difficulty-scaffolding', 'adaptive-adjustment']
    };
    
    return priorities[audience] || priorities.student;
  }
  
  /**
   * 生成设计建议
   */
  static generateDesignRecommendations(appliedPrinciples, difficultyAssessment) {
    const recommendations = [];
    
    if (appliedPrinciples.includes('progressive-disclosure')) {
      recommendations.push('采用渐进式揭露策略，将复杂概念分解为递进的学习单元');
    }
    
    if (appliedPrinciples.includes('contextual-narrative')) {
      recommendations.push('将学习点嵌入情境化叙事，增强学习动机和记忆');
    }
    
    if (appliedPrinciples.includes('constructive-failure')) {
      recommendations.push('设计建设性失败反馈，将错误转化为学习机会');
    }
    
    if (appliedPrinciples.includes('seamless-flow')) {
      recommendations.push('确保教学流程无缝衔接，避免中断认知过程');
    }
    
    if (appliedPrinciples.includes('high-frequency-questioning')) {
      recommendations.push('采用高频提问策略，每个关键概念都有对应的检查点问题');
    }
    
    if (appliedPrinciples.includes('problem-solving-opportunities')) {
      recommendations.push('提供充分的解题机会，允许多次尝试并给予渐进式提示');
    }
    
    if (appliedPrinciples.includes('difficulty-scaffolding')) {
      recommendations.push('建立三级难度体系（基础/应用/综合），确保问题既有挑战性又可解决');
    }
    
    if (appliedPrinciples.includes('adaptive-adjustment')) {
      recommendations.push('基于实时表现智能调整问题难度和反馈，实现个性化学习路径');
    }
    
    // 根据难度调整建议
    if (difficultyAssessment.overallDifficulty >= 8) {
      recommendations.push('高难度内容建议增加更多示例和类比解释');
    }
    
    if (difficultyAssessment.potentialChallenges.some(c => c.severity === '高')) {
      recommendations.push('针对潜在难点设计专门的解释和练习');
    }
    
    return recommendations;
  }
}

module.exports = DesignPrincipleApplier;