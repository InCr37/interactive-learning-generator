/**
 * 选择题生成器（增强版）
 * 
 * 创建情境化知识检查点，生成选择题并提供即时反馈。
 * 支持新设计原则：高频提问、难度分级、解题机会、智能调整。
 * 支持单选、多选等题型，设计基于学习目标的评估。
 */

const DesignPrinciples = require('../utils/designPrinciples');

class QuizGenerator {
  /**
   * 生成选择题（增强版）
   * @param {Array} concepts - 概念数组
   * @param {Array} learningObjectives - 学习目标数组
   * @param {Object} difficultyAssessment - 难度评估结果
   * @param {Object} options - 选项（可选）
   * @returns {Promise<Array>} 选择题数组
   */
  /**
   * 计算两个例子的相似度
   * @param {Object} example1 - 例子1 {concept, method, keyParams, text}
   * @param {Object} example2 - 例子2
   * @returns {number} 相似度 0-1
   */
  static calculateExampleSimilarity(example1, example2) {
    if (!example1 || !example2) return 0;

    let similarity = 0;
    let totalWeight = 0;

    // 概念匹配 (权重: 0.4)
    if (example1.concept === example2.concept) {
      similarity += 0.4;
    }
    totalWeight += 0.4;

    // 方法匹配 (权重: 0.3)
    if (example1.method === example2.method) {
      similarity += 0.3;
    }
    totalWeight += 0.3;

    // 参数变化检查 (权重: 0.3)
    if (example1.keyParams && example2.keyParams) {
      const paramChange = this.calculateParamChange(example1.keyParams, example2.keyParams);
      // 如果参数变化小，相似度高
      similarity += 0.3 * (1 - paramChange);
    }
    totalWeight += 0.3;

    return similarity / totalWeight;
  }

  /**
   * 计算参数变化程度
   */
  static calculateParamChange(params1, params2) {
    if (!params1 || !params2) return 0.5;
    if (typeof params1 !== 'number' || typeof params2 !== 'number') return 0.5;
    const max = Math.max(Math.abs(params1), Math.abs(params2), 1);
    return Math.min(1, Math.abs(params1 - params2) / max);
  }

  /**
   * 检查问题是否与教过的例子过于相似
   */
  static isTooSimilarToRecentExample(question, recentExamples, threshold = 0.8) {
    if (!recentExamples || recentExamples.length === 0) return false;

    const questionConcept = question.concepts && question.concepts[0];

    for (const example of recentExamples) {
      // 先快速检查概念是否相同
      if (questionConcept && example.concept === questionConcept) {
        const similarity = this.calculateExampleSimilarity(question, example);
        if (similarity >= threshold) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 生成差异化问题（当检测到相似时）
   */
  static generateDifferentiatedQuestion(originalQuestion, reason) {
    // 返回修改建议
    return {
      ...originalQuestion,
      differentiationNote: `与教过的例子过于相似 (${reason})，建议修改参数或添加验证理解的 twist`,
      metadata: {
        ...originalQuestion.metadata,
        wasDifferentiated: true,
        differentiationReason: reason
      }
    };
  }

  static async generate(concepts, learningObjectives, difficultyAssessment, options = {}) {
    console.log('生成选择题（增强版）');

    const {
      applyPrinciples = [], // 要应用的设计原则
      userPerformance = null, // 用户历史表现
      generateQuickQuizzes = true, // 是否生成微型检查点
      maxQuizzes = 10, // 最大题目数量
      taughtConcepts = [], // 最近教过的概念，用于去重
      recentExamples = [] // 最近教过的例子，用于相似度检查
    } = options;
    
    // 如果没有概念，生成默认选择题
    if (!concepts || concepts.length === 0) {
      return [this.createDefaultQuiz()];
    }
    
    // 1. 生成主测验题目（基于学习目标）
    const mainQuizzes = await this.generateMainQuizzes(
      concepts,
      learningObjectives,
      difficultyAssessment,
      { maxQuizzes: Math.min(learningObjectives.length, 5) }
    );
    
    // 2. 如果启用高频提问，生成微型检查点
    let quickQuizzes = [];
    if (generateQuickQuizzes && applyPrinciples.includes('high-frequency-questioning')) {
      quickQuizzes = await this.generateQuickQuizzes(
        concepts,
        difficultyAssessment,
        { countPerConcept: 1, difficultyDistribution: 'balanced' }
      );
    }
    
    // 3. 如果启用难度分级，按难度级别生成题目
    let difficultyBasedQuizzes = [];
    if (applyPrinciples.includes('difficulty-scaffolding')) {
      difficultyBasedQuizzes = await this.generateByDifficultyLevel(
        concepts,
        difficultyAssessment,
        { distribution: { basic: 0.7, applied: 0.2, advanced: 0.1 } }
      );
    }
    
    // 4. 合并所有题目
    let allQuizzes = [...mainQuizzes, ...quickQuizzes, ...difficultyBasedQuizzes];

    // 4.5 相似度检查：避免问题与教过的例子重复
    if (recentExamples && recentExamples.length > 0) {
      const deduplicatedQuizzes = [];
      for (const quiz of allQuizzes) {
        if (this.isTooSimilarToRecentExample(quiz, recentExamples)) {
          // 标记为需要差异化，而非直接丢弃
          const differentiated = this.generateDifferentiatedQuestion(quiz, 'concept-match');
          deduplicatedQuizzes.push(differentiated);
        } else {
          deduplicatedQuizzes.push(quiz);
        }
      }
      allQuizzes = deduplicatedQuizzes;
    }

    // 5. 如果启用智能调整，根据用户表现调整题目
    if (applyPrinciples.includes('adaptive-adjustment') && userPerformance) {
      allQuizzes = await this.applyAdaptiveAdjustment(
        allQuizzes,
        userPerformance,
        difficultyAssessment
      );
    }
    
    // 6. 如果启用解题机会，添加渐进提示支持
    if (applyPrinciples.includes('problem-solving-opportunities')) {
      allQuizzes = allQuizzes.map(quiz => ({
        ...quiz,
        maxAttempts: 3,
        progressiveHints: this.generateProgressiveHints(quiz),
        designPrinciples: [...(quiz.designPrinciples || []), 'problem-solving-opportunities']
      }));
    }
    
    // 7. 限制题目数量，确保至少有一个题目
    const finalQuizzes = allQuizzes.slice(0, maxQuizzes);
    if (finalQuizzes.length === 0) {
      return [this.createDefaultQuiz()];
    }
    
    // 8. 标记应用的设计原则
    const appliedPrinciplesSet = new Set(applyPrinciples);
    finalQuizzes.forEach(quiz => {
      quiz.designPrinciples = [...(quiz.designPrinciples || []), ...Array.from(appliedPrinciplesSet)];
    });
    
    return finalQuizzes;
  }
  
  /**
   * 生成主测验题目（基于学习目标）
   */
  static async generateMainQuizzes(concepts, learningObjectives, difficultyAssessment, options = {}) {
    const quizzes = [];
    const { maxQuizzes = 5 } = options;
    
    const quizCount = Math.min(learningObjectives.length, maxQuizzes);
    
    // 为每个学习目标生成选择题
    for (let i = 0; i < quizCount; i++) {
      const objective = learningObjectives[i];
      const relatedConcepts = this.findRelatedConcepts(concepts, objective);
      
      const quiz = await this.createQuizForObjective(
        objective,
        relatedConcepts,
        difficultyAssessment,
        i
      );
      
      if (quiz) {
        quizzes.push(quiz);
      }
    }
    
    return quizzes;
  }
  
  /**
   * 为学习目标创建选择题
   */
  static async createQuizForObjective(objective, relatedConcepts, difficultyAssessment, index) {
    if (!objective) return null;
    
    const quizId = `quiz_${index + 1}`;
    const objectiveText = objective.text || '掌握相关概念';
    
    // 确定题型（基于布鲁姆层级）
    const questionType = this.determineQuestionType(objective.bloomLevel);
    
    // 生成题干
    const questionStem = this.generateQuestionStem(objectiveText, relatedConcepts, questionType);
    
    // 生成选项
    const options = this.generateOptions(relatedConcepts, questionType, difficultyAssessment);
    
    // 确定正确答案
    const correctAnswers = this.determineCorrectAnswers(options);
    
    // 生成反馈
    const feedback = this.generateFeedback(objectiveText, correctAnswers, questionType);
    
    // 计算难度
    const quizDifficulty = this.calculateQuizDifficulty(questionType, options.length, difficultyAssessment.overallDifficulty);
    
    return {
      id: quizId,
      title: `检查点：${objectiveText.substring(0, 30)}...`,
      objectiveId: objective.id,
      questionType, // 'single-choice', 'multiple-choice', 'true-false', 'quick-quiz'
      questionStem,
      options,
      correctAnswers,
      feedback,
      difficulty: quizDifficulty,
      estimatedTime: this.calculateQuizTime(questionType, options.length, quizDifficulty),
      concepts: relatedConcepts.map(c => c.term),
      designPrinciples: ['constructive-failure']
    };
  }
  
  /**
   * 生成微型检查点（高频提问）
   */
  static async generateQuickQuizzes(concepts, difficultyAssessment, options = {}) {
    const {
      countPerConcept = 1,
      difficultyDistribution = 'balanced' // 'balanced'|'progressive'
    } = options;
    
    const quickQuizzes = [];
    let quickQuizId = 1;
    
    // 为每个概念生成微型检查点
    for (const concept of concepts) {
      const conceptQuizzes = [];
      
      for (let i = 0; i < countPerConcept; i++) {
        // 确定难度级别（基于分布）
        const difficultyLevel = this.determineQuickQuizDifficulty(
          quickQuizId,
          difficultyDistribution,
          difficultyAssessment.overallDifficulty
        );
        
        // 生成微型题目
        const quickQuiz = await this.createQuickQuiz(
          concept,
          difficultyLevel,
          difficultyAssessment,
          quickQuizId
        );
        
        if (quickQuiz) {
          conceptQuizzes.push(quickQuiz);
          quickQuizId++;
        }
      }
      
      quickQuizzes.push(...conceptQuizzes);
    }
    
    return quickQuizzes.slice(0, 20); // 限制最多20个微型检查点
  }
  
  /**
   * 创建微型检查点
   */
  static async createQuickQuiz(concept, difficultyLevel, difficultyAssessment, index) {
    const quizId = `quick_quiz_${index}`;
    
    // 基于难度级别确定题目类型和复杂度
    const { questionType, optionCount } = this.getQuickQuizSpecs(difficultyLevel);
    
    // 生成题干（简化版）
    const questionStem = this.generateQuickQuizQuestionStem(concept, difficultyLevel);
    
    // 生成选项
    const options = this.generateQuickQuizOptions(concept, optionCount, difficultyLevel);
    
    // 确定正确答案
    const correctAnswers = this.determineCorrectAnswers(options);
    
    // 生成快速反馈
    const feedback = this.generateQuickQuizFeedback(concept, correctAnswers.length > 0);
    
    // 计算难度（微型题目通常较低）
    const quizDifficulty = Math.max(1, Math.min(5, difficultyLevel * 2));
    
    return {
      id: quizId,
      title: `快速检查：${concept.term || '概念'}`,
      questionType: 'quick-quiz',
      questionStem,
      options,
      correctAnswers,
      feedback,
      difficulty: quizDifficulty,
      estimatedTime: 1, // 微型检查点预计1分钟
      concepts: [concept.term || '概念'],
      designPrinciples: ['high-frequency-questioning'],
      metadata: {
        isQuickQuiz: true,
        difficultyLevel: difficultyLevel, // 'basic'|'applied'|'advanced'
        conceptFocus: concept.term
      }
    };
  }
  
  /**
   * 按难度级别生成题目
   */
  static async generateByDifficultyLevel(concepts, difficultyAssessment, options = {}) {
    const {
      distribution = { basic: 0.7, applied: 0.2, advanced: 0.1 },
      maxPerLevel = 5
    } = options;
    
    const quizzes = [];
    
    // 计算每个级别的题目数量
    const basicCount = Math.min(Math.ceil(concepts.length * distribution.basic), maxPerLevel);
    const appliedCount = Math.min(Math.ceil(concepts.length * distribution.applied), maxPerLevel);
    const advancedCount = Math.min(Math.ceil(concepts.length * distribution.advanced), maxPerLevel);
    
    // 生成基础级题目
    for (let i = 0; i < basicCount && i < concepts.length; i++) {
      const quiz = await this.createDifficultyBasedQuiz(
        concepts[i],
        'basic',
        difficultyAssessment,
        `basic_${i + 1}`
      );
      if (quiz) quizzes.push(quiz);
    }
    
    // 生成应用级题目
    for (let i = 0; i < appliedCount && i < concepts.length; i++) {
      const quiz = await this.createDifficultyBasedQuiz(
        concepts[(i + basicCount) % concepts.length],
        'applied',
        difficultyAssessment,
        `applied_${i + 1}`
      );
      if (quiz) quizzes.push(quiz);
    }
    
    // 生成综合级题目
    for (let i = 0; i < advancedCount && i < concepts.length; i++) {
      const quiz = await this.createDifficultyBasedQuiz(
        concepts[(i + basicCount + appliedCount) % concepts.length],
        'advanced',
        difficultyAssessment,
        `advanced_${i + 1}`
      );
      if (quiz) quizzes.push(quiz);
    }
    
    return quizzes;
  }
  
  /**
   * 创建基于难度的题目
   */
  static async createDifficultyBasedQuiz(concept, difficultyLevel, difficultyAssessment, suffix) {
    const quizId = `difficulty_${difficultyLevel}_${suffix}`;
    
    // 基于难度级别确定题型和复杂度
    const { questionType, cognitiveLevel, optionCount } = this.getDifficultyLevelSpecs(difficultyLevel);
    
    // 生成题干
    const questionStem = this.generateDifficultyBasedQuestionStem(concept, difficultyLevel, cognitiveLevel);
    
    // 生成选项（根据难度级别调整干扰项质量）
    const options = this.generateDifficultyBasedOptions(concept, optionCount, difficultyLevel);
    
    // 确定正确答案
    const correctAnswers = this.determineCorrectAnswers(options);
    
    // 生成级别特定反馈
    const feedback = this.generateDifficultyBasedFeedback(concept, difficultyLevel, correctAnswers.length > 0);
    
    // 计算难度
    const quizDifficulty = this.calculateDifficultyLevelScore(difficultyLevel, difficultyAssessment.overallDifficulty);
    
    return {
      id: quizId,
      title: `${this.getDifficultyLevelName(difficultyLevel)}练习：${concept.term || '概念'}`,
      questionType,
      questionStem,
      options,
      correctAnswers,
      feedback,
      difficulty: quizDifficulty,
      estimatedTime: this.calculateDifficultyLevelTime(difficultyLevel),
      concepts: [concept.term || '概念'],
      designPrinciples: ['difficulty-scaffolding'],
      metadata: {
        difficultyLevel,
        cognitiveLevel,
        successThreshold: this.getSuccessThreshold(difficultyLevel)
      }
    };
  }
  
  /**
   * 应用自适应调整
   */
  static async applyAdaptiveAdjustment(quizzes, userPerformance, difficultyAssessment) {
    if (!userPerformance || !userPerformance.history || userPerformance.history.length === 0) {
      return quizzes; // 无历史数据，返回原题目
    }
    
    const adjustedQuizzes = [];
    const recentPerformance = userPerformance.history.slice(-10); // 最近10次表现
    
    // 计算整体正确率
    const correctRate = recentPerformance.filter(p => p.correct).length / Math.max(1, recentPerformance.length);
    
    // 计算平均尝试次数
    const avgAttempts = recentPerformance.reduce((sum, p) => sum + (p.attempts || 1), 0) / Math.max(1, recentPerformance.length);
    
    // 确定调整策略
    const adjustmentStrategy = this.determineAdjustmentStrategy(correctRate, avgAttempts, difficultyAssessment.overallDifficulty);
    
    // 应用调整到每个题目
    for (const quiz of quizzes) {
      const adjustedQuiz = this.adjustQuizBasedOnStrategy(quiz, adjustmentStrategy);
      adjustedQuizzes.push({
        ...adjustedQuiz,
        designPrinciples: [...(quiz.designPrinciples || []), 'adaptive-adjustment'],
        adaptiveMetadata: {
          appliedStrategy: adjustmentStrategy.name,
          originalDifficulty: quiz.difficulty,
          adjustedDifficulty: adjustedQuiz.difficulty,
          triggerMetrics: { correctRate, avgAttempts }
        }
      });
    }
    
    return adjustedQuizzes;
  }
  
  /**
   * 生成渐进式提示（按需显示，只有点击"请求提示"才显示）
   * Level 3 永远不泄露答案，只提供方法指引
   */
  static generateProgressiveHints(quiz) {
    const concept = quiz.concepts && quiz.concepts.length > 0 ? quiz.concepts[0] : '这个概念';

    return [
      {
        level: 1,
        trigger: 'manual_request',
        content: `提示：仔细分析题目中的关键条件和约束，回想相关概念的基本特征。`
      },
      {
        level: 2,
        trigger: 'second_request',
        content: `提示：将问题分解为小步骤，逐一验证每个选项与题目要求的匹配程度。`
      },
      {
        level: 3,
        trigger: 'third_request',
        content: this.generateMethodGuidingHint(quiz)
      }
    ];
  }

  /**
   * 生成方法指引提示（不泄露答案）
   */
  static generateMethodGuidingHint(quiz) {
    const hints = [
      `提示：回顾解题的核心方法，逐项检查是否符合。排除法可以帮你缩小范围。`,
      `提示：思考这类问题的常见解题思路，逐一验证选项的合理性。`,
      `提示：注意理解题目考察的本质，不要被表述的细节迷惑。`,
      `提示：检查每个选项是否完整满足题目的所有条件。`
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  }
  
  // ========== 辅助方法 ==========
  
  /**
   * 确定微型检查点难度
   */
  static determineQuickQuizDifficulty(index, distribution, overallDifficulty) {
    if (distribution === 'progressive') {
      // 渐进式：随题目序号增加难度
      const progression = Math.min(3, Math.floor(index / 5) + 1);
      return progression; // 1-3
    }
    
    // 平衡分布：基于整体难度
    const baseLevel = Math.max(1, Math.min(3, Math.floor(overallDifficulty / 4)));
    return baseLevel;
  }
  
  /**
   * 获取微型检查点规格
   */
  static getQuickQuizSpecs(difficultyLevel) {
    const specs = {
      1: { questionType: 'single-choice', optionCount: 3 }, // 基础
      2: { questionType: 'single-choice', optionCount: 4 }, // 中等
      3: { questionType: 'multiple-choice', optionCount: 4 }  // 高级
    };
    
    return specs[difficultyLevel] || specs[1];
  }
  
  /**
   * 生成微型检查点题干
   */
  static generateQuickQuizQuestionStem(concept, difficultyLevel) {
    const templates = {
      1: [
        `关于"${concept.term}"的基本定义，以下哪项正确？`,
        `"${concept.term}"的主要特征是什么？`,
        `以下哪项描述了"${concept.term}"的核心概念？`
      ],
      2: [
        `如何应用"${concept.term}"解决简单问题？`,
        `关于"${concept.term}"的理解，以下哪项最准确？`,
        `在什么情况下会使用"${concept.term}"？`
      ],
      3: [
        `"${concept.term}"与其他相关概念的区别是什么？`,
        `以下关于"${concept.term}"的哪些陈述是正确的？（多选）`,
        `如何优化使用"${concept.term}"的方法？`
      ]
    };
    
    const levelTemplates = templates[difficultyLevel] || templates[1];
    return levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
  }
  
  /**
   * 生成微型检查点选项
   */
  static generateQuickQuizOptions(concept, optionCount, difficultyLevel) {
    const options = [];
    
    // 生成正确选项
    if (concept.definition) {
      options.push({
        id: 'option_correct',
        text: concept.definition.substring(0, 60) + (concept.definition.length > 60 ? '...' : ''),
        isCorrect: true,
        explanation: `这是"${concept.term}"的准确定义。`
      });
    } else {
      options.push({
        id: 'option_correct',
        text: `对"${concept.term}"的正确理解`,
        isCorrect: true,
        explanation: '这是对该概念的正确理解。'
      });
    }
    
    // 生成干扰项
    const distractorCount = optionCount - 1;
    const distractors = this.generateQuickDistractors(concept, distractorCount, difficultyLevel);
    
    // 合并并随机排序
    const allOptions = [...options, ...distractors].slice(0, optionCount);
    return this.shuffleArray(allOptions).map((opt, idx) => ({
      ...opt,
      id: `option_${idx + 1}`
    }));
  }
  
  /**
   * 生成微型检查点干扰项
   */
  static generateQuickDistractors(concept, count, difficultyLevel) {
    const distractors = [];
    const misconceptionTypes = ['过度泛化', '概念混淆', '片面理解'];
    
    for (let i = 0; i < count; i++) {
      const type = misconceptionTypes[i % misconceptionTypes.length];
      let text = '';
      
      switch (type) {
        case '过度泛化':
          text = `"${concept.term}"适用于所有情况。`;
          break;
        case '概念混淆':
          text = `"${concept.term}"与另一个概念含义相同。`;
          break;
        case '片面理解':
          text = `"${concept.term}"只有单一特征。`;
          break;
      }
      
      if (text) {
        distractors.push({
          id: `distractor_${i + 1}`,
          text,
          isCorrect: false,
          explanation: `这是常见误解：${type}。`
        });
      }
    }
    
    return distractors;
  }
  
  /**
   * 生成微型检查点反馈
   */
  static generateQuickQuizFeedback(concept, isCorrect) {
    if (isCorrect) {
      return `很好！你正确理解了"${concept.term}"。`;
    } else {
      return `再想想。回顾一下"${concept.term}"的定义和特征。`;
    }
  }
  
  /**
   * 获取难度级别规格
   */
  static getDifficultyLevelSpecs(difficultyLevel) {
    const specs = {
      'basic': {
        questionType: 'single-choice',
        cognitiveLevel: '记忆/理解',
        optionCount: 3,
        successThreshold: 0.7
      },
      'applied': {
        questionType: 'single-choice',
        cognitiveLevel: '应用/分析',
        optionCount: 4,
        successThreshold: 0.5
      },
      'advanced': {
        questionType: 'multiple-choice',
        cognitiveLevel: '综合/创造',
        optionCount: 4,
        successThreshold: 0.3
      }
    };
    
    return specs[difficultyLevel] || specs.basic;
  }
  
  /**
   * 生成基于难度的题干
   */
  static generateDifficultyBasedQuestionStem(concept, difficultyLevel, cognitiveLevel) {
    const templates = {
      'basic': [
        `"${concept.term}"的基本定义是什么？`,
        `以下哪项准确描述了"${concept.term}"？`,
        `"${concept.term}"的主要特征包括什么？`
      ],
      'applied': [
        `如何应用"${concept.term}"解决以下问题？`,
        `在给定情境中，使用"${concept.term}"的正确方法是什么？`,
        `以下哪种情况最适合使用"${concept.term}"？`
      ],
      'advanced': [
        `"${concept.term}"与其他概念的相互作用如何？`,
        `如何优化基于"${concept.term}"的系统设计？`,
        `以下关于"${concept.term}"的哪些陈述是正确的？（多选）`
      ]
    };
    
    const levelTemplates = templates[difficultyLevel] || templates.basic;
    return levelTemplates[Math.floor(Math.random() * levelTemplates.length)];
  }
  
  /**
   * 生成基于难度的选项
   */
  static generateDifficultyBasedOptions(concept, optionCount, difficultyLevel) {
    // 基础实现，可进一步细化
    return this.generateQuickQuizOptions(concept, optionCount, 
      difficultyLevel === 'basic' ? 1 : 
      difficultyLevel === 'applied' ? 2 : 3
    );
  }
  
  /**
   * 生成基于难度的反馈
   */
  static generateDifficultyBasedFeedback(concept, difficultyLevel, isCorrect) {
    const feedbackTemplates = {
      'basic': {
        correct: `很好！你掌握了"${concept.term}"的基础知识。`,
        incorrect: `需要加强基础理解。回顾"${concept.term}"的定义和核心特征。`
      },
      'applied': {
        correct: `优秀！你能够正确应用"${concept.term}"解决问题。`,
        incorrect: `应用能力需要提升。思考"${concept.term}"在不同情境下的使用方法。`
      },
      'advanced': {
        correct: `卓越！你深入理解了"${concept.term}"的复杂关系。`,
        incorrect: `综合理解有待加强。分析"${concept.term}"的多个维度和相互关系。`
      }
    };
    
    const templates = feedbackTemplates[difficultyLevel] || feedbackTemplates.basic;
    return isCorrect ? templates.correct : templates.incorrect;
  }
  
  /**
   * 计算难度级别分数
   */
  static calculateDifficultyLevelScore(difficultyLevel, overallDifficulty) {
    const baseScores = {
      'basic': 3,
      'applied': 6,
      'advanced': 8
    };
    
    const baseScore = baseScores[difficultyLevel] || 5;
    return Math.max(1, Math.min(10, (baseScore + overallDifficulty) / 2));
  }
  
  /**
   * 计算难度级别时间
   */
  static calculateDifficultyLevelTime(difficultyLevel) {
    const baseTimes = {
      'basic': 2,
      'applied': 3,
      'advanced': 5
    };
    
    return baseTimes[difficultyLevel] || 3;
  }
  
  /**
   * 获取难度级别名称
   */
  static getDifficultyLevelName(difficultyLevel) {
    const names = {
      'basic': '基础',
      'applied': '应用',
      'advanced': '综合'
    };
    
    return names[difficultyLevel] || '基础';
  }
  
  /**
   * 获取成功阈值
   */
  static getSuccessThreshold(difficultyLevel) {
    const thresholds = {
      'basic': 0.7,
      'applied': 0.5,
      'advanced': 0.3
    };
    
    return thresholds[difficultyLevel] || 0.7;
  }
  
  /**
   * 确定调整策略
   */
  static determineAdjustmentStrategy(correctRate, avgAttempts, overallDifficulty) {
    if (correctRate > 0.8 && avgAttempts < 1.5) {
      return {
        name: 'increase_difficulty',
        action: '提升难度',
        parameters: { difficultyMultiplier: 1.3, reduceOptions: false }
      };
    } else if (correctRate < 0.4 || avgAttempts > 2.5) {
      return {
        name: 'decrease_difficulty',
        action: '降低难度',
        parameters: { difficultyMultiplier: 0.7, simplifyQuestions: true }
      };
    } else if (correctRate < 0.6 && avgAttempts > 2) {
      return {
        name: 'provide_more_hints',
        action: '增加提示',
        parameters: { hintLevel: 'enhanced', reduceTimePressure: true }
      };
    } else {
      return {
        name: 'maintain_current',
        action: '保持当前',
        parameters: { difficultyMultiplier: 1.0 }
      };
    }
  }
  
  /**
   * 基于策略调整题目
   */
  static adjustQuizBasedOnStrategy(quiz, strategy) {
    const adjustedQuiz = { ...quiz };
    
    switch (strategy.name) {
      case 'increase_difficulty':
        adjustedQuiz.difficulty = Math.min(10, Math.round(quiz.difficulty * strategy.parameters.difficultyMultiplier));
        // 可能增加选项数量或改为多选题
        if (quiz.questionType === 'single-choice' && Math.random() > 0.5) {
          adjustedQuiz.questionType = 'multiple-choice';
        }
        break;
        
      case 'decrease_difficulty':
        adjustedQuiz.difficulty = Math.max(1, Math.round(quiz.difficulty * strategy.parameters.difficultyMultiplier));
        // 可能减少选项数量或提供更多线索
        if (quiz.options.length > 3) {
          adjustedQuiz.options = quiz.options.slice(0, 3);
        }
        break;
        
      case 'provide_more_hints':
        // 在反馈中添加额外提示
        adjustedQuiz.feedback = `${quiz.feedback} (提示：${this.generateAdditionalHint(quiz)})`;
        adjustedQuiz.estimatedTime = Math.round(quiz.estimatedTime * 1.2); // 增加时间
        break;
    }
    
    return adjustedQuiz;
  }
  
  /**
   * 生成额外提示
   */
  static generateAdditionalHint(quiz) {
    const concept = quiz.concepts && quiz.concepts.length > 0 ? quiz.concepts[0] : '这个概念';
    
    const hints = [
      `关注${concept}的核心定义`,
      `排除明显错误的选项`,
      `考虑每个选项与${concept}的相关性`,
      `回顾相似问题的解决方法`
    ];
    
    return hints[Math.floor(Math.random() * hints.length)];
  }
  
  /**
   * 生成正确答案解释
   */
  static generateExplanationForCorrectAnswer(quiz) {
    const correctOption = quiz.options.find(opt => quiz.correctAnswers.includes(opt.id));
    if (correctOption && correctOption.explanation) {
      return correctOption.explanation;
    }
    
    return '这个选项最准确地反映了相关概念的知识和应用。';
  }
  
  // ========== 原有方法（保持兼容性）==========
  
  /**
   * 确定题型
   */
  static determineQuestionType(bloomLevel) {
    // 基于布鲁姆分类法选择题型
    const bloomToType = {
      '记忆': 'single-choice',
      '理解': 'single-choice',
      '应用': 'single-choice',
      '分析': 'multiple-choice',
      '评价': 'multiple-choice',
      '创造': 'multiple-choice'
    };
    
    return bloomToType[bloomLevel] || 'single-choice';
  }
  
  /**
   * 生成题干
   */
  static generateQuestionStem(objectiveText, relatedConcepts, questionType) {
    const mainConcept = relatedConcepts.length > 0 ? relatedConcepts[0].term : '相关概念';
    
    // 基于题型和目标的题干模板
    const templates = {
      'single-choice': [
        `根据学习目标"${objectiveText}"，关于"${mainConcept}"以下哪项描述最准确？`,
        `在学习"${mainConcept}"时，以下哪个选项最能体现"${objectiveText}"的要求？`,
        `关于"${mainConcept}"的理解，以下哪个选项最符合学习目标的要求？`
      ],
      'multiple-choice': [
        `基于"${objectiveText}"的学习目标，以下关于"${mainConcept}"的哪些描述是正确的？（多选）`,
        `在理解"${mainConcept}"时，以下哪些表述体现了"${objectiveText}"的核心要求？`,
        `关于"${mainConcept}"的应用，以下哪些选项是符合学习目标的正确做法？`
      ],
      'true-false': [
        `判断以下关于"${mainConcept}"的陈述是否正确，以达到"${objectiveText}"的学习目标。`,
        `基于学习目标"${objectiveText}"，判断以下对"${mainConcept}"的描述是否正确。`
      ]
    };
    
    const templateSet = templates[questionType] || templates['single-choice'];
    return templateSet[Math.floor(Math.random() * templateSet.length)];
  }
  
  /**
   * 生成选项
   */
  static generateOptions(relatedConcepts, questionType, difficultyAssessment) {
    const options = [];
    const mainConcept = relatedConcepts.length > 0 ? relatedConcepts[0] : null;
    
    if (!mainConcept) {
      // 默认选项
      return [
        { id: 'option_1', text: '选项A是正确的', isCorrect: true },
        { id: 'option_2', text: '选项B是错误的', isCorrect: false },
        { id: 'option_3', text: '选项C部分正确', isCorrect: false },
        { id: 'option_4', text: '选项D需要更多信息', isCorrect: false }
      ];
    }
    
    // 生成正确选项
    if (mainConcept.definition) {
      options.push({
        id: 'option_correct',
        text: mainConcept.definition,
        isCorrect: true,
        explanation: '这是"${mainConcept.term}"的准确定义。'
      });
    } else {
      options.push({
        id: 'option_correct',
        text: `对"${mainConcept.term}"的正确理解`,
        isCorrect: true,
        explanation: '这是对该概念的正确理解。'
      });
    }
    
    // 生成干扰项（基于常见误解）
    const distractors = this.generateDistractors(relatedConcepts, difficultyAssessment);
    
    // 合并选项并随机排序
    const allOptions = [...options, ...distractors].slice(0, 4); // 限制最多4个选项
    
    // 随机排序（但标记正确性）
    return this.shuffleArray(allOptions).map((opt, index) => ({
      ...opt,
      id: `option_${index + 1}` // 重新编号
    }));
  }
  
  /**
   * 生成干扰项
   */
  static generateDistractors(relatedConcepts, difficultyAssessment) {
    const distractors = [];
    const mainConcept = relatedConcepts.length > 0 ? relatedConcepts[0] : null;
    
    if (!mainConcept) return distractors;
    
    // 常见误解类型
    const misconceptionTypes = [
      '过度泛化', // 扩大应用范围
      '过度特化', // 缩小应用范围
      '概念混淆', // 与其他概念混淆
      '因果倒置', // 颠倒因果关系
      '片面理解'  // 只理解部分特征
    ];
    
    // 根据难度决定干扰项质量
    const distractorCount = Math.min(3, Math.max(1, Math.floor(difficultyAssessment.overallDifficulty / 3)));
    
    for (let i = 0; i < distractorCount; i++) {
      const type = misconceptionTypes[i % misconceptionTypes.length];
      
      let distractorText = '';
      let explanation = '';
      
      switch (type) {
        case '过度泛化':
          distractorText = `"${mainConcept.term}"适用于所有类似情境。`;
          explanation = '这是过度泛化，实际应用有特定条件限制。';
          break;
        case '过度特化':
          distractorText = `"${mainConcept.term}"只适用于特定案例。`;
          explanation = '这是过度特化，概念的应用范围更广泛。';
          break;
        case '概念混淆':
          if (relatedConcepts.length > 1) {
            const otherConcept = relatedConcepts[1];
            distractorText = `"${mainConcept.term}"与"${otherConcept.term}"含义完全相同。`;
            explanation = '这两个概念有相似之处但也有重要区别。';
          }
          break;
        case '因果倒置':
          distractorText = `"${mainConcept.term}"是结果而非原因。`;
          explanation = '因果关系需要根据具体情境分析。';
          break;
        case '片面理解':
          distractorText = `"${mainConcept.term}"只具有单一特征。`;
          explanation = '概念通常具有多个维度和特征。';
          break;
      }
      
      if (distractorText) {
        distractors.push({
          id: `distractor_${i + 1}`,
          text: distractorText,
          isCorrect: false,
          explanation,
          misconceptionType: type
        });
      }
    }
    
    return distractors;
  }
  
  /**
   * 确定正确答案
   */
  static determineCorrectAnswers(options) {
    return options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.id);
  }
  
  /**
   * 生成反馈
   */
  static generateFeedback(objectiveText, correctAnswers, questionType) {
    const correctCount = correctAnswers.length;
    const totalOptions = 4; // 假设4个选项
    
    if (correctCount === 0) {
      return '看起来你可能有些误解。让我们回顾一下相关概念...';
    }
    
    if (questionType === 'single-choice' && correctCount === 1) {
      return `正确！你理解了"${objectiveText}"的核心要求。`;
    }
    
    if (questionType === 'multiple-choice') {
      if (correctCount === totalOptions) {
        return `完美！你全面掌握了"${objectiveText}"的所有要点。`;
      } else if (correctCount >= totalOptions / 2) {
        return `不错！你掌握了主要要点，但还有一些细节需要注意。`;
      } else {
        return `部分正确。让我们看看哪些地方需要进一步加强理解。`;
      }
    }
    
    return `学习进展中。继续加油！`;
  }
  
  /**
   * 计算选择题难度
   */
  static calculateQuizDifficulty(questionType, optionCount, overallDifficulty) {
    let baseDifficulty = 5;
    
    // 题型难度
    if (questionType === 'multiple-choice') baseDifficulty += 1;
    if (questionType === 'true-false') baseDifficulty -= 1;
    
    // 选项数量影响
    if (optionCount > 4) baseDifficulty += 1;
    
    // 结合整体难度
    const combined = (baseDifficulty + overallDifficulty) / 2;
    
    return Math.max(1, Math.min(10, combined));
  }
  
  /**
   * 计算预计答题时间
   */
  static calculateQuizTime(questionType, optionCount, quizDifficulty) {
    const baseTime = 2; // 分钟
    const typeMultiplier = questionType === 'multiple-choice' ? 1.5 : 1;
    const optionMultiplier = 1 + (optionCount - 2) * 0.2;
    const difficultyMultiplier = 1 + (quizDifficulty - 5) * 0.1;
    
    return Math.round(baseTime * typeMultiplier * optionMultiplier * difficultyMultiplier);
  }
  
  /**
   * 查找相关概念
   */
  static findRelatedConcepts(concepts, objective) {
    if (!objective || !concepts || concepts.length === 0) return concepts.slice(0, 3);
    
    const objectiveText = objective.text || '';
    
    // 简单匹配：目标文本中包含概念术语
    const related = concepts.filter(concept => 
      concept.term && objectiveText.includes(concept.term.substring(0, Math.min(concept.term.length, 4)))
    );
    
    return related.length > 0 ? related.slice(0, 3) : concepts.slice(0, 3);
  }
  
  /**
   * 创建默认选择题
   */
  static createDefaultQuiz() {
    return {
      id: 'quiz_default',
      title: '基础知识检查点',
      objectiveId: 'default',
      questionType: 'single-choice',
      questionStem: '以下哪项描述最符合学习要求？',
      options: [
        { id: 'option_1', text: '正确理解核心概念', isCorrect: true },
        { id: 'option_2', text: '片面理解概念', isCorrect: false },
        { id: 'option_3', text: '误解概念含义', isCorrect: false },
        { id: 'option_4', text: '完全不了解概念', isCorrect: false }
      ],
      correctAnswers: ['option_1'],
      feedback: '很好！你掌握了基础知识。',
      difficulty: 5,
      estimatedTime: 3,
      concepts: ['基础概念'],
      designPrinciples: ['constructive-failure']
    };
  }
  
  /**
   * 数组随机排序
   */
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = QuizGenerator;