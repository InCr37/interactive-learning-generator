/**
 * 教学设计原则库
 * 
 * 定义和应用渐进式揭露、情境化叙事、建设性失败反馈等教学原则。
 * 提供原则的具体实现策略和配置。
 */

class DesignPrinciples {
  /**
   * 应用渐进式揭露原则
   * @param {Array} concepts - 概念数组
   * @param {number} overallDifficulty - 总体难度评分
   * @returns {Object} 渐进式揭露策略
   */
  static applyProgressiveDisclosure(concepts, overallDifficulty) {
    // 确定揭露步骤数量（基于概念数量和难度）
    const stepCount = this.calculateProgressiveSteps(concepts.length, overallDifficulty);
    
    // 分组概念（按类型或复杂度）
    const conceptGroups = this.groupConceptsForProgressiveDisclosure(concepts, stepCount);
    
    return {
      principle: 'progressive-disclosure',
      description: '将复杂概念分解为递进的学习单元，逐步揭露信息',
      steps: stepCount,
      conceptGroups,
      strategies: [
        '从简单到复杂逐步引入概念',
        '每个步骤建立在之前步骤的基础上',
        '逐步增加复杂性和抽象性',
        '提供阶段性的成功反馈'
      ],
      implementation: {
        moduleOrder: conceptGroups.map((group, index) => ({
          step: index + 1,
          focus: group.map(c => c.term).join('、'),
          goal: `掌握 ${group.length} 个相关概念`
        })),
        pacingGuide: this.generatePacingGuide(stepCount, overallDifficulty)
      }
    };
  }
  
  /**
   * 应用情境化叙事原则
   * @param {Array} concepts - 概念数组
   * @param {Array} learningObjectives - 学习目标数组
   * @param {Object} options - 选项（如neutral: true）
   * @returns {Object} 情境化叙事策略
   */
  static applyContextualNarrative(concepts, learningObjectives, options = {}) {
    const neutral = options.neutral !== false;
    
    // 选择叙事框架（基于内容和受众）
    const narrativeFramework = this.selectNarrativeFramework(concepts, learningObjectives, neutral);
    
    // 生成叙事元素
    const narrativeElements = this.generateNarrativeElements(concepts, narrativeFramework);
    
    return {
      principle: 'contextual-narrative',
      description: '将学习点嵌入到连贯的叙事情境中，通过故事增强理解和记忆',
      framework: narrativeFramework,
      neutral: neutral,
      elements: narrativeElements,
      strategies: [
        '将抽象概念与具体情境关联',
        '通过角色和场景使学习具象化',
        '创建有意义的问题解决情境',
        '叙事进展反映学习进展'
      ],
      implementation: {
        scenario: narrativeFramework.scenario,
        roles: neutral ? ['学习者', '学习助手', '领域专家'] : ['学习者', '导师', '同伴'],
        settings: narrativeFramework.settings,
        narrativeArc: this.generateNarrativeArc(concepts.length)
      }
    };
  }
  
  /**
   * 应用建设性失败原则
   * @param {Array} concepts - 概念数组
   * @param {Array} potentialChallenges - 潜在难点
   * @returns {Object} 建设性失败策略
   */
  static applyConstructiveFailure(concepts, potentialChallenges) {
    // 识别常见误解和错误
    const commonMisconceptions = this.identifyCommonMisconceptions(concepts, potentialChallenges);
    
    // 设计失败反馈机制
    const feedbackMechanisms = this.designFeedbackMechanisms(commonMisconceptions);
    
    return {
      principle: 'constructive-failure',
      description: '将错误和失败设计为学习机会，提供建设性反馈而非惩罚',
      commonMisconceptions,
      feedbackMechanisms,
      strategies: [
        '预期常见错误并设计针对性反馈',
        '错误触发解释性而非评判性回应',
        '提供修正路径和额外练习',
        '失败后提供鼓励和继续前进的机会'
      ],
      implementation: {
        errorHandling: feedbackMechanisms.map(mechanism => ({
          misconception: mechanism.misconception,
          feedbackType: mechanism.feedbackType,
          remedialAction: mechanism.remedialAction
        })),
        failureRecovery: {
          maxAttempts: 3,
          hintProgression: ['通用提示', '具体提示', '完整解释'],
          alternativeApproaches: ['可视化解释', '简化版本', '类比说明']
        }
      }
    };
  }
  
  /**
   * 应用无缝教学流原则
   * @param {number} conceptCount - 概念数量
   * @param {number} overallDifficulty - 总体难度评分
   * @returns {Object} 无缝教学流策略
   */
  static applySeamlessFlow(conceptCount, overallDifficulty) {
    // 设计流畅的学习路径
    const learningPath = this.designSeamlessLearningPath(conceptCount, overallDifficulty);
    
    // 确定过渡策略
    const transitionStrategies = this.determineTransitionStrategies(overallDifficulty);
    
    return {
      principle: 'seamless-flow',
      description: '确保学习体验流畅自然，避免中断认知过程',
      learningPath,
      transitionStrategies,
      strategies: [
        '平滑的概念过渡和上下文衔接',
        '避免突兀的模式切换或界面跳转',
        '保持学习目标和活动的连贯性',
        '自然整合学习、练习和反馈'
      ],
      implementation: {
        flowDesign: {
          pacing: this.calculateOptimalPacing(conceptCount, overallDifficulty),
          transitions: transitionStrategies,
          integrationPoints: this.identifyIntegrationPoints(conceptCount)
        },
        continuityMeasures: [
          '维持一致的视觉风格和交互模式',
          '使用连贯的叙事线索连接不同部分',
          '进度指示和上下文提醒'
        ]
      }
    };
  }
  
  // ========== 辅助方法 ==========
  
  static calculateProgressiveSteps(conceptCount, difficulty) {
    // 基础步骤：每3-5个概念一个步骤
    const baseSteps = Math.ceil(conceptCount / 4);
    
    // 根据难度调整
    const difficultyAdjustment = Math.ceil(difficulty / 3);
    
    return Math.max(2, Math.min(baseSteps + difficultyAdjustment, 8));
  }
  
  static groupConceptsForProgressiveDisclosure(concepts, stepCount) {
    if (!concepts || concepts.length === 0) return [];
    
    // 简单分组：按顺序平均分配
    const groups = [];
    const conceptsPerGroup = Math.ceil(concepts.length / stepCount);
    
    for (let i = 0; i < stepCount; i++) {
      const start = i * conceptsPerGroup;
      const end = Math.min(start + conceptsPerGroup, concepts.length);
      if (start < concepts.length) {
        groups.push(concepts.slice(start, end));
      }
    }
    
    return groups;
  }
  
  static generatePacingGuide(stepCount, difficulty) {
    const baseTimePerStep = 5; // 分钟
    const difficultyMultiplier = 1 + (difficulty - 5) / 10; // 难度5时为1，10时为1.5
    
    return Array.from({ length: stepCount }, (_, i) => ({
      step: i + 1,
      estimatedTime: Math.round(baseTimePerStep * difficultyMultiplier * (i + 1) / stepCount * 2),
      focus: i === 0 ? '基础概念引入' : 
             i === stepCount - 1 ? '综合应用和总结' :
             `概念深化和扩展`
    }));
  }
  
  static selectNarrativeFramework(concepts, learningObjectives, neutral) {
    // 根据概念类型选择叙事框架
    const conceptTerms = concepts.map(c => c.term).join(' ');
    
    // 检查概念类型
    const hasMath = /[数算公式几何代数积分微分]/i.test(conceptTerms);
    const hasScience = /[物化生实实验观察]/i.test(conceptTerms);
    const hasHistory = /[历史事件时期人物文化]/i.test(conceptTerms);
    const hasTechnology = /[技术程序代码算法系统]/i.test(conceptTerms);
    
    // 选择框架
    if (hasMath) {
      return neutral ? 
        { name: '工程问题解决', scenario: '作为工程师解决实际问题', settings: ['工程场景', '实验室', '设计工作室'] } :
        { name: '数学探索', scenario: '探索数学世界中的模式和规律', settings: ['数学王国', '问题森林', '解谜洞穴'] };
    } else if (hasScience) {
      return neutral ?
        { name: '科学研究', scenario: '进行科学实验和观察', settings: ['实验室', '野外考察', '观测站'] } :
        { name: '科学探险', scenario: '探索自然界的奥秘', settings: ['微观世界', '生态系统', '宇宙空间'] };
    } else if (hasHistory) {
      return neutral ?
        { name: '历史分析', scenario: '分析历史事件和趋势', settings: ['档案馆', '历史遗址', '研究机构'] } :
        { name: '时间旅行', scenario: '穿越时空探索历史', settings: ['古代文明', '历史转折点', '文化交汇处'] };
    } else if (hasTechnology) {
      return neutral ?
        { name: '技术开发', scenario: '设计和开发技术解决方案', settings: ['开发工作室', '测试环境', '部署平台'] } :
        { name: '数字世界', scenario: '在数字世界中构建和创造', settings: ['代码宇宙', '算法迷宫', '系统架构'] };
    } else {
      return neutral ?
        { name: '知识探索', scenario: '探索和学习新知识领域', settings: ['学习空间', '知识库', '思考角落'] } :
        { name: '学习冒险', scenario: '踏上知识探索之旅', settings: ['知识森林', '智慧山脉', '理解海洋'] };
    }
  }
  
  static generateNarrativeElements(concepts, framework) {
    const mainConcept = concepts.length > 0 ? concepts[0].term : '核心知识';
    
    return {
      protagonist: '学习者',
      guide: framework.neutral ? '学习助手' : '知识向导',
      challenge: `理解和应用${mainConcept}等相关概念`,
      goal: '掌握目标知识并能够应用',
      stakes: '提升知识水平和解决问题的能力',
      resolution: '通过逐步学习和实践成功掌握概念'
    };
  }
  
  static generateNarrativeArc(conceptCount) {
    return {
      exposition: '引入学习情境和初始概念',
      risingAction: '逐步引入更复杂的概念和挑战',
      climax: '关键概念的综合应用和问题解决',
      fallingAction: '巩固理解和解决剩余问题',
      resolution: '总结学习成果和展望应用'
    };
  }
  
  static identifyCommonMisconceptions(concepts, potentialChallenges) {
    const misconceptions = [];
    
    // 基于概念生成常见误解
    concepts.forEach(concept => {
      if (concept.term && concept.term.length > 2) {
        misconceptions.push({
          concept: concept.term,
          misconception: `误解${concept.term}的含义或应用范围`,
          likelihood: '中',
          impact: '可能影响后续概念理解'
        });
      }
    });
    
    // 基于潜在挑战添加误解
    potentialChallenges.forEach(challenge => {
      if (challenge.type === 'mathematical') {
        misconceptions.push({
          concept: '数学符号和公式',
          misconception: '误读数学符号或错误应用公式',
          likelihood: '高',
          impact: '导致计算错误和概念混淆'
        });
      }
    });
    
    return misconceptions.slice(0, 5); // 限制数量
  }
  
  static designFeedbackMechanisms(misconceptions) {
    return misconceptions.map((misconception, index) => ({
      id: `feedback_${index + 1}`,
      misconception: misconception.misconception,
      feedbackType: 'constructive',
      feedbackTemplate: `看起来你对"${misconception.concept}"的理解可能有些偏差。让我们重新审视一下：`,
      remedialAction: '提供简化解释、可视化示例和对比说明',
      hintSequence: [
        '思考这个概念的常见应用场景',
        '回顾基本定义和关键特征',
        '尝试一个更简单的例子'
      ]
    }));
  }
  
  static designSeamlessLearningPath(conceptCount, overallDifficulty) {
    const pathLength = Math.min(conceptCount * 2, 20); // 路径节点数量
    const checkpoints = Math.ceil(pathLength / 4);
    
    return {
      length: pathLength,
      checkpoints,
      milestones: Array.from({ length: checkpoints }, (_, i) => ({
        milestone: i + 1,
        position: Math.floor((i + 1) * pathLength / checkpoints),
        purpose: i === 0 ? '建立基础' : 
                i === checkpoints - 1 ? '综合评估' :
                '巩固和扩展'
      })),
      flowType: overallDifficulty >= 7 ? 'guided-exploratory' : 'linear-guided'
    };
  }
  
  static determineTransitionStrategies(difficulty) {
    const strategies = ['概念衔接', '情境延续', '渐进复杂化'];
    
    if (difficulty >= 7) {
      strategies.push('难点预警和准备');
      strategies.push('阶段性总结和回顾');
    }
    
    if (difficulty >= 5) {
      strategies.push('新旧知识连接');
    }
    
    return strategies;
  }
  
  static calculateOptimalPacing(conceptCount, difficulty) {
    const baseTime = conceptCount * 2; // 每概念2分钟基础
    const difficultyFactor = 1 + (difficulty - 5) * 0.1; // 难度5时为1，10时为1.5
    
    return {
      estimatedTotalMinutes: Math.round(baseTime * difficultyFactor),
      recommendedSessionLength: difficulty >= 7 ? 15 : 25,
      breakInterval: difficulty >= 7 ? 5 : 10
    };
  }
  
  static identifyIntegrationPoints(conceptCount) {
    const points = [];
    
    // 每3-4个概念一个整合点
    const integrationFrequency = 4;
    
    for (let i = integrationFrequency; i < conceptCount; i += integrationFrequency) {
      points.push({
        position: i,
        purpose: '整合前序概念，建立知识网络',
        activity: '综合练习或概念关系图'
      });
    }
    
    return points;
  }

  /**
   * 应用高频提问原则
   * @param {Array} concepts - 概念数组
   * @param {Object} difficultyAssessment - 难度评估结果
   * @returns {Object} 高频提问策略
   */
  static applyHighFrequencyQuestioning(concepts, difficultyAssessment) {
    // 每个概念至少生成一个问题
    const questionsPerConcept = this.calculateQuestionsPerConcept(concepts.length, difficultyAssessment.overallDifficulty);
    
    // 生成问题分布
    const questionDistribution = this.distributeQuestions(concepts, questionsPerConcept);
    
    // 确定问题类型分布
    const questionTypes = this.determineQuestionTypes(difficultyAssessment.overallDifficulty);
    
    return {
      principle: 'high-frequency-questioning',
      description: '通过高频提问促进主动学习，每个概念都有对应的检查点',
      questionsPerConcept,
      questionDistribution,
      questionTypes,
      strategies: [
        '每个关键概念至少对应一个问题',
        '问题难度梯度分布（基础/应用/综合）',
        '提问时机分散在整个学习过程中',
        '问题类型多样化（选择题、简答题、情境题）'
      ],
      implementation: {
        questionDensity: questionsPerConcept,
        placement: '嵌入式（讲解后立即练习）',
        feedbackTiming: '即时反馈',
        adaptiveAdjustment: '根据表现动态调整问题难度'
      }
    };
  }

  /**
   * 应用解题机会原则
   * @param {Array} concepts - 概念数组
   * @param {Array} potentialChallenges - 潜在难点
   * @returns {Object} 解题机会策略
   */
  static applyProblemSolvingOpportunities(concepts, potentialChallenges) {
    // 识别需要解题机会的关键点
    const opportunityPoints = this.identifyProblemSolvingOpportunities(concepts, potentialChallenges);
    
    // 设计解题支持机制
    const supportMechanisms = this.designProblemSolvingSupport(opportunityPoints);
    
    return {
      principle: 'problem-solving-opportunities',
      description: '提供充分的解题机会和支持，将错误转化为学习机会',
      opportunityPoints,
      supportMechanisms,
      strategies: [
        '为每个难点设计专门的解题练习',
        '提供渐进式提示（从通用线索到具体步骤）',
        '允许多次尝试，记录最佳表现',
        '错误触发建设性反馈而非惩罚'
      ],
      implementation: {
        maxAttempts: 3,
        hintLevels: ['概念提示', '步骤提示', '方法指引'],
        recoveryPaths: ['简化版本', '分步指导', '类比解释'],
        feedbackFocus: '过程而非结果，强调思维方法'
      }
    };
  }

  /**
   * 应用难度分级原则
   * @param {Array} concepts - 概念数组
   * @param {Object} difficultyAssessment - 难度评估结果
   * @returns {Object} 难度分级策略
   */
  static applyDifficultyScaffolding(concepts, difficultyAssessment) {
    // 建立三级难度体系
    const difficultyLevels = this.establishDifficultyLevels(concepts, difficultyAssessment);
    
    // 设计难度过渡
    const difficultyTransitions = this.designDifficultyTransitions(difficultyLevels);
    
    return {
      principle: 'difficulty-scaffolding',
      description: '建立三级难度体系，确保问题既有挑战性又可解决',
      difficultyLevels,
      difficultyTransitions,
      strategies: [
        '基础级：识别和记忆（70%正确率目标）',
        '应用级：分析和应用（50%正确率目标）',
        '综合级：综合和创造（30%正确率目标）',
        '根据用户表现动态调整难度级别'
      ],
      implementation: {
        levelDistribution: '70%基础, 20%应用, 10%综合（初始）',
        progressionRule: '连续正确 → 升级难度，连续错误 → 降级难度',
        challengeZone: '保持在最近发展区（可解决但有挑战）'
      }
    };
  }

  /**
   * 应用智能调整原则
   * @param {Array} concepts - 概念数组
   * @param {Object} difficultyAssessment - 难度评估结果
   * @returns {Object} 智能调整策略
   */
  static applyAdaptiveAdjustment(concepts, difficultyAssessment) {
    // 定义调整维度
    const adjustmentDimensions = this.defineAdjustmentDimensions();
    
    // 设计调整规则
    const adjustmentRules = this.designAdjustmentRules(difficultyAssessment.overallDifficulty);
    
    return {
      principle: 'adaptive-adjustment',
      description: '基于实时表现智能调整问题难度、数量和反馈',
      adjustmentDimensions,
      adjustmentRules,
      strategies: [
        '根据正确率动态调整后续题目难度',
        '基于答题时间调整问题复杂度',
        '根据错误模式提供针对性补充练习',
        '学习路径个性化（加速/减速/强化）'
      ],
      implementation: {
        adjustmentTriggers: ['正确率', '尝试次数', '答题时间', '错误模式'],
        adjustmentGranularity: '题目级、概念级、模块级',
        dataCollection: '实时表现跟踪，历史表现分析',
        decisionMaking: '基于规则的调整（非机器学习）'
      }
    };
  }

  // ========== 新原则的辅助方法 ==========

  static calculateQuestionsPerConcept(conceptCount, overallDifficulty) {
    // 基础：每个概念至少1个问题
    const base = 1;
    // 难度调整：难度越高，问题越多（但不超过3个）
    const difficultyBonus = Math.min(2, Math.floor(overallDifficulty / 5));
    return Math.min(base + difficultyBonus, 3);
  }

  static distributeQuestions(concepts, questionsPerConcept) {
    const distribution = {};
    concepts.forEach((concept, index) => {
      distribution[concept.term || `概念${index + 1}`] = {
        total: questionsPerConcept,
        basic: Math.ceil(questionsPerConcept * 0.7),
        applied: Math.floor(questionsPerConcept * 0.2),
        advanced: Math.floor(questionsPerConcept * 0.1)
      };
    });
    return distribution;
  }

  static determineQuestionTypes(overallDifficulty) {
    const types = [
      { type: 'multiple-choice', weight: 0.5, description: '选择题，快速检查理解' },
      { type: 'short-answer', weight: 0.3, description: '简答题，促进主动回忆' },
      { type: 'scenario-based', weight: 0.2, description: '情境题，应用知识解决问题' }
    ];
    
    // 难度越高，情境题比例增加
    if (overallDifficulty >= 7) {
      types[2].weight = 0.3;
      types[0].weight = 0.4;
    }
    
    return types;
  }

  static identifyProblemSolvingOpportunities(concepts, potentialChallenges) {
    const opportunities = [];
    
    // 每个概念至少一个机会
    concepts.forEach(concept => {
      opportunities.push({
        concept: concept.term || '未知概念',
        type: 'concept-application',
        priority: 'high',
        description: `应用${concept.term}解决实际问题`
      });
    });
    
    // 潜在难点的额外机会
    potentialChallenges.forEach(challenge => {
      if (challenge.severity === '高') {
        opportunities.push({
          concept: challenge.relatedConcept || '综合应用',
          type: 'challenge-overcome',
          priority: 'critical',
          description: `克服难点：${challenge.description}`
        });
      }
    });
    
    return opportunities.slice(0, 10); // 限制数量
  }

  static designProblemSolvingSupport(opportunityPoints) {
    return opportunityPoints.map((opportunity, index) => ({
      opportunityId: `opp_${index + 1}`,
      concept: opportunity.concept,
      supportLevels: [
        {
          level: 1,
          support: '概念提示',
          content: `回想${opportunity.concept}的基本定义和关键特征`
        },
        {
          level: 2,
          support: '步骤指导',
          content: '尝试将问题分解为以下步骤...'
        },
        {
          level: 3,
          support: '方法指引',
          content: '提示：回顾解题的核心方法，逐项验证选项的合理性...'
        }
      ],
      maxAttempts: 3,
      feedbackFocus: '强调思维过程而非最终答案'
    }));
  }

  static establishDifficultyLevels(concepts, difficultyAssessment) {
    return {
      basic: {
        description: '识别和记忆级',
        cognitiveLevel: '记忆/理解',
        successThreshold: 0.7,
        example: '给定真值表，选出正确输出',
        questionCount: Math.ceil(concepts.length * 0.7)
      },
      applied: {
        description: '应用和分析级',
        cognitiveLevel: '应用/分析',
        successThreshold: 0.5,
        example: '设计一个简单逻辑电路实现指定功能',
        questionCount: Math.ceil(concepts.length * 0.2)
      },
      advanced: {
        description: '综合和创造级',
        cognitiveLevel: '综合/创造',
        successThreshold: 0.3,
        example: '优化现有电路，减少逻辑门数量',
        questionCount: Math.ceil(concepts.length * 0.1)
      }
    };
  }

  static designDifficultyTransitions(difficultyLevels) {
    return {
      basicToApplied: {
        condition: 'basicLevelScore >= 0.8',
        action: '引入20%的应用级问题',
        gradual: true
      },
      appliedToAdvanced: {
        condition: 'appliedLevelScore >= 0.6',
        action: '引入10%的综合级问题',
        gradual: true
      },
      downgrade: {
        condition: 'currentLevelScore < 0.4',
        action: '降低难度一级，增加基础练习',
        recoveryGoal: '巩固基础后重新尝试'
      }
    };
  }

  static defineAdjustmentDimensions() {
    return [
      {
        dimension: 'difficulty',
        description: '题目难度级别',
        adjustableRange: ['basic', 'applied', 'advanced'],
        adjustmentFactor: '正确率、尝试次数'
      },
      {
        dimension: 'quantity',
        description: '题目数量',
        adjustableRange: [1, 5],
        adjustmentFactor: '答题时间、疲劳程度'
      },
      {
        dimension: 'feedback',
        description: '反馈详细程度',
        adjustableRange: ['minimal', 'standard', 'detailed'],
        adjustmentFactor: '错误类型、学习风格'
      },
      {
        dimension: 'pacing',
        description: '学习节奏',
        adjustableRange: ['slow', 'normal', 'fast'],
        adjustmentFactor: '整体表现、时间限制'
      }
    ];
  }

  static designAdjustmentRules(overallDifficulty) {
    const rules = [
      {
        trigger: 'correctRate > 0.8',
        action: 'increaseDifficulty',
        parameters: { increment: 1, max: 'advanced' },
        description: '高正确率时提升难度'
      },
      {
        trigger: 'correctRate < 0.4',
        action: 'decreaseDifficulty',
        parameters: { decrement: 1, min: 'basic' },
        description: '低正确率时降低难度'
      },
      {
        trigger: 'attempts > 2 && !correct',
        action: 'provideHint',
        parameters: { hintLevel: 'incremental' },
        description: '多次尝试失败时提供渐进提示'
      },
      {
        trigger: 'timeSpent > 120', // 秒
        action: 'simplifyQuestion',
        parameters: { simplificationLevel: 'intermediate' },
        description: '思考时间过长时简化问题'
      }
    ];
    
    // 难度越高，调整越敏感
    if (overallDifficulty >= 7) {
      rules[0].trigger = 'correctRate > 0.7';
      rules[1].trigger = 'correctRate < 0.5';
    }
    
    return rules;
  }

  /**
   * 应用先讲后练原则 (Proactive Teaching)
   * 确保每个概念先充分讲解，再进行练习
   */
  static applyProactiveTeaching(concepts, difficultyAssessment) {
    const isBeginner = difficultyAssessment.overallDifficulty < 5;

    return {
      principle: 'proactive-teaching',
      description: '先讲后练：确保学习者建立正确心理模型后再检验理解',
      isRequired: isBeginner,
      strategies: [
        '每个概念必须先讲解再提问',
        '讲解时使用通俗语言，避免术语未解释',
        '提供足够的背景知识铺垫',
        '使用类比和日常例子解释抽象概念'
      ],
      implementation: {
        teachBeforeQuizRatio: isBeginner ? '2:1' : '1:1',
        minExplanationLength: isBeginner ? 3 : 1,
        terminologyCheck: true,
        preQuizConfirmation: 'ensure-understanding'
      }
    };
  }

  /**
   * 应用渐进式代码建构原则 (Progressive Code Building)
   * 分步展示代码，每次只引入一个新元素
   */
  static applyProgressiveCodeBuilding(concepts, isProgrammingRelated) {
    return {
      principle: 'progressive-code-building',
      description: '代码示例分步展示：先骨架后填充，逐步增加复杂度',
      isRequired: isProgrammingRelated,
      strategies: [
        '每次只引入一个新元素',
        '先展示代码结构和骨架',
        '逐步填充细节和逻辑',
        '每步展示后解释该部分作用'
      ],
      implementation: {
        maxElementsPerStep: 2,
        stepTypes: ['structure', 'keyword', 'variable', 'operator', 'logic'],
        codeAnnotation: true,
        lineByLineExplanation: true
      }
    };
  }

  /**
   * 应用理解确认原则 (Understanding Confirmation)
   * 在进入下一主题前确认学习者真正理解
   */
  static applyUnderstandingConfirmation(concepts, difficultyAssessment) {
    const isBeginner = difficultyAssessment.overallDifficulty < 5;

    return {
      principle: 'understanding-confirmation',
      description: '主动输出型检查：验证真正理解而非表面记忆',
      isRequired: isBeginner,
      strategies: [
        '使用"用自己的话解释"等主动输出检查',
        '提供"你能举一个例子吗？"类型问题',
        '要求学习者预测代码行为',
        '使用概念对比和区分问题'
      ],
      implementation: {
        confirmationTypes: ['explain-in-words', 'give-example', 'predict-output', 'compare-contrast'],
        requiredBeforeProceed: isBeginner,
        feedbackOnMisunderstanding: 'immediate-explanation'
      }
    };
  }

  /**
   * 应用小步快走原则 (Chunked Delivery)
   * 每次只教授一个核心概念，控制认知负荷
   */
  static applyChunkedDelivery(concepts, overallDifficulty) {
    const conceptsPerChunk = Math.max(1, Math.floor(5 / overallDifficulty));

    return {
      principle: 'chunked-delivery',
      description: '小步快走：将复杂内容分解为可消化的小块',
      strategies: [
        '每次只教授一个核心概念',
        '每个教学单元控制在3-5分钟',
        '在块之间提供短暂休息或回顾',
        '建立清晰的概念边界'
      ],
      implementation: {
        conceptsPerChunk,
        chunkTimeEstimate: 3 + (overallDifficulty * 0.5),
        reviewInterval: 3,
        breakOpportunities: true
      }
    };
  }

  /**
   * 应用视觉化代码注释原则 (Visual Code Highlighting)
   * 代码配合语法高亮和逐行解释
   */
  static applyVisualCodeHighlighting(codeExamples) {
    return {
      principle: 'visual-code-highlighting',
      description: '代码语法高亮 + 逐行解释，让结构一目了然',
      strategies: [
        '关键字使用醒目颜色',
        '变量名使用不同颜色',
        '运算符和符号高亮显示',
        '每行代码下方提供解释'
      ],
      implementation: {
        highlightColors: {
          keyword: '#569CD6',
          variable: '#9CDCFE',
          operator: '#D4D4D4',
          string: '#CE9178',
          comment: '#6A9955'
        },
        lineAnnotations: true,
        codeStructure: ['header', 'body', 'footer']
      }
    };
  }

  /**
   * 应用实时困难检测原则 (Real-time Struggle Detection)
   * 自动识别学习者困惑信号
   */
  static applyRealTimeStruggleDetection() {
    return {
      principle: 'real-time-struggle-detection',
      description: '检测困惑信号并自动提供帮助',
      struggleSignals: [
        'repeated_wrong_answers',
        'explicit_confusion',
        'request_for_help',
        'long_pause',
        'asking_same_question'
      ],
      strategies: [
        '检测到困惑时自动提供额外解释',
        '降低后续题目难度',
        '提供更多示例',
        '建议回顾相关概念'
      ],
      implementation: {
        detectionThreshold: 2,
        autoAdaptDifficulty: true,
        provideHintInsteadOfQuiz: true
      }
    };
  }

  /**
   * 应用自适应语言切换原则 (Adaptive Language)
   * 根据难度和用户偏好调整语言复杂度
   */
  static applyAdaptiveLanguage(language, difficulty) {
    return {
      principle: 'adaptive-language',
      description: '根据内容难度和用户水平调整语言复杂度',
      strategies: [
        '检测专业术语时自动提供通俗解释',
        '双语对照（中英术语对照）',
        '简单内容使用简单词汇',
        '复杂内容保持专业但增加解释'
      ],
      implementation: {
        primaryLanguage: language || 'en',
        includeBilingualGlossary: true,
        terminologyMap: true,
        simplifyOnDifficulty: true
      }
    };
  }

  /**
   * 检测内容是否为编程相关
   */
  static isProgrammingRelated(concepts) {
    const programmingKeywords = [
      'code', 'programming', 'function', 'variable', 'loop', 'if', 'else',
      'arduino', 'python', 'javascript', 'algorithm', 'syntax', 'statement',
      'operator', 'boolean', 'digital', 'analog', 'pin', 'output', 'input'
    ];

    const conceptText = concepts.map(c => c.term + ' ' + (c.definition || '')).join(' ').toLowerCase();

    return programmingKeywords.some(keyword => conceptText.includes(keyword));
  }
}

module.exports = DesignPrinciples;