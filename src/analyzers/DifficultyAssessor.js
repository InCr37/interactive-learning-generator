/**
 * 难度评估器
 * 
 * 判断概念复杂度，评估学习难度，识别潜在难点。
 * 基于概念密度、抽象程度、先验知识要求等因素进行评估。
 */

class DifficultyAssessor {
  /**
   * 评估概念难度
   * @param {Array} concepts - 概念数组
   * @param {Object} processedContent - 处理后的内容结构
   * @returns {Promise<Object>} 难度评估结果
   */
  static async assess(concepts, processedContent) {
    console.log('评估学习难度');
    
    const text = processedContent.cleanedText || processedContent.extractedText || '';
    
    // 计算文本复杂度
    const textComplexity = this.assessTextComplexity(text);
    
    // 评估概念难度
    const conceptDifficulty = this.assessConceptDifficulty(concepts);
    
    // 识别潜在难点
    const potentialChallenges = this.identifyPotentialChallenges(concepts, text);
    
    // 综合难度评分（1-10，10最难）
    const overallDifficulty = this.calculateOverallDifficulty(
      textComplexity, 
      conceptDifficulty, 
      potentialChallenges
    );
    
    return {
      overallDifficulty, // 1-10
      textComplexity,
      conceptDifficulty,
      potentialChallenges,
      recommendations: this.generateRecommendations(overallDifficulty, potentialChallenges)
    };
  }
  
  /**
   * 评估文本复杂度
   */
  static assessTextComplexity(text) {
    if (!text || text.length === 0) return { score: 3, level: '低' };
    
    const lines = text.split('\n');
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
    const words = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 0);
    
    // 计算指标
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    const avgWordLength = words.length > 0 ? words.reduce((sum, w) => sum + w.length, 0) / words.length : 0;
    const uniqueWordRatio = words.length > 0 ? new Set(words).size / words.length : 0;
    
    // 复杂度评分（简化版）
    let score = 5; // 中等
    
    if (avgSentenceLength > 25) score += 2;
    if (avgWordLength > 4) score += 1;
    if (uniqueWordRatio > 0.7) score += 1;
    
    // 检查专业术语数量（简化）
    const technicalTerms = ['公式', '定理', '定义', '原理', '算法', '函数', '变量', '参数'];
    const termCount = technicalTerms.filter(term => text.includes(term)).length;
    score += Math.min(termCount, 3);
    
    score = Math.max(1, Math.min(10, score));
    
    const level = score <= 4 ? '低' : score <= 7 ? '中' : '高';
    
    return {
      score,
      level,
      metrics: {
        avgSentenceLength: avgSentenceLength.toFixed(1),
        avgWordLength: avgWordLength.toFixed(1),
        uniqueWordRatio: uniqueWordRatio.toFixed(2),
        technicalTermCount: termCount
      }
    };
  }
  
  /**
   * 评估概念难度
   */
  static assessConceptDifficulty(concepts) {
    if (!concepts || concepts.length === 0) {
      return { score: 3, level: '低', details: [] };
    }
    
    const conceptDetails = concepts.map(concept => {
      // 简单启发式：长术语、抽象术语更难
      const termLength = concept.term ? concept.term.length : 0;
      const hasDefinition = concept.definition ? 1 : 0;
      const isAbstract = this.isAbstractConcept(concept.term);
      
      let difficulty = 5; // 中等
      if (termLength > 6) difficulty += 1;
      if (!hasDefinition) difficulty += 1;
      if (isAbstract) difficulty += 2;
      
      difficulty = Math.max(1, Math.min(10, difficulty));
      
      return {
        conceptId: concept.id,
        term: concept.term,
        difficulty,
        reasons: [
          termLength > 6 ? '术语较长' : null,
          !hasDefinition ? '缺乏明确定义' : null,
          isAbstract ? '抽象概念' : null
        ].filter(Boolean)
      };
    });
    
    const avgDifficulty = conceptDetails.reduce((sum, c) => sum + c.difficulty, 0) / conceptDetails.length;
    const level = avgDifficulty <= 4 ? '低' : avgDifficulty <= 7 ? '中' : '高';
    
    return {
      score: avgDifficulty,
      level,
      details: conceptDetails
    };
  }
  
  /**
   * 识别潜在难点
   */
  static identifyPotentialChallenges(concepts, text) {
    const challenges = [];
    
    // 检查是否有数学公式或符号
    const mathPatterns = [/[∫∑∏√∞≈≠≤≥±×÷]/, /[a-zA-Z]_\{[^}]+\}/, /\\frac\{[^}]+\}\{[^}]+\}/];
    const hasMath = mathPatterns.some(pattern => pattern.test(text));
    if (hasMath) {
      challenges.push({
        type: 'mathematical',
        description: '包含数学公式或符号，可能需要数学基础',
        severity: '中'
      });
    }
    
    // 检查是否有复杂逻辑或流程
    const logicKeywords = ['如果', '那么', '否则', '当', '循环', '递归', '算法'];
    const hasLogic = logicKeywords.some(keyword => text.includes(keyword));
    if (hasLogic) {
      challenges.push({
        type: 'logical',
        description: '包含条件判断或流程控制，需要逻辑思维',
        severity: '中'
      });
    }
    
    // 检查概念之间的依赖关系（简化）
    if (concepts.length > 5) {
      challenges.push({
        type: 'conceptual_density',
        description: `概念较多（${concepts.length}个），可能需要分步学习`,
        severity: '中'
      });
    }
    
    // 检查是否有需要先验知识
    const prerequisiteTerms = ['之前学过', '基础知识', '前置条件', '假设'];
    const hasPrerequisites = prerequisiteTerms.some(term => text.includes(term));
    if (hasPrerequisites) {
      challenges.push({
        type: 'prerequisite',
        description: '可能需要相关先验知识',
        severity: '高'
      });
    }
    
    return challenges;
  }
  
  /**
   * 计算总体难度
   */
  static calculateOverallDifficulty(textComplexity, conceptDifficulty, potentialChallenges) {
    let score = (textComplexity.score + conceptDifficulty.score) / 2;
    
    // 根据挑战调整
    const challengeWeights = { '低': 0.5, '中': 1, '高': 2 };
    const challengeAdjustment = potentialChallenges.reduce((sum, challenge) => {
      return sum + challengeWeights[challenge.severity] || 0;
    }, 0);
    
    score += challengeAdjustment * 0.5;
    score = Math.max(1, Math.min(10, score));
    
    return score;
  }
  
  /**
   * 生成学习建议
   */
  static generateRecommendations(difficultyScore, challenges) {
    const recommendations = [];
    
    if (difficultyScore >= 7) {
      recommendations.push('建议分多次学习，每次专注一个子概念');
      recommendations.push('配合实例和练习巩固理解');
    }
    
    if (difficultyScore >= 5) {
      recommendations.push('学习时做笔记，记录关键概念和关系');
    }
    
    challenges.forEach(challenge => {
      if (challenge.severity === '高') {
        recommendations.push(`注意：${challenge.description}，建议先掌握相关基础`);
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('难度适中，可按顺序学习');
    }
    
    return recommendations;
  }
  
  /**
   * 判断是否为抽象概念
   */
  static isAbstractConcept(term) {
    const abstractIndicators = ['性', '化', '度', '论', '学', '概念', '原理', '理论', '方法'];
    return abstractIndicators.some(indicator => term.includes(indicator));
  }
}

module.exports = DifficultyAssessor;