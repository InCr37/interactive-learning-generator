/**
 * 互动练习生成器
 * 
 * 设计实践操作场景，让学习者应用所学知识解决问题。
 * 生成步骤式练习、模拟操作、案例分析等互动活动。
 */

class InteractiveExerciseGenerator {
  /**
   * 生成互动练习
   * @param {Array} concepts - 概念数组
   * @param {Array} learningObjectives - 学习目标数组
   * @param {Object} difficultyAssessment - 难度评估结果
   * @returns {Promise<Array>} 互动练习数组
   */
  static async generate(concepts, learningObjectives, difficultyAssessment) {
    console.log('生成互动练习');
    
    const exercises = [];
    
    // 如果没有概念，生成默认练习
    if (!concepts || concepts.length === 0) {
      return [this.createDefaultExercise()];
    }
    
    // 根据概念数量决定练习数量
    const exerciseCount = Math.min(Math.ceil(concepts.length / 3), 4);
    
    // 为每组概念生成练习
    for (let i = 0; i < exerciseCount; i++) {
      const startIdx = i * Math.ceil(concepts.length / exerciseCount);
      const endIdx = Math.min(startIdx + Math.ceil(concepts.length / exerciseCount), concepts.length);
      const conceptGroup = concepts.slice(startIdx, endIdx);
      
      // 找到相关学习目标
      const relatedObjective = this.findRelatedObjective(learningObjectives, conceptGroup, i);
      
      const exercise = await this.createExerciseForConcepts(
        conceptGroup,
        relatedObjective,
        difficultyAssessment,
        i
      );
      
      if (exercise) {
        exercises.push(exercise);
      }
    }
    
    // 确保至少有一个练习
    if (exercises.length === 0) {
      exercises.push(this.createDefaultExercise());
    }
    
    return exercises;
  }
  
  /**
   * 为概念组创建练习
   */
  static async createExerciseForConcepts(concepts, objective, difficultyAssessment, index) {
    if (!concepts || concepts.length === 0) return null;
    
    const exerciseId = `exercise_${index + 1}`;
    const mainConcept = concepts[0];
    const conceptNames = concepts.map(c => c.term).join('、');
    
    // 确定练习类型
    const exerciseType = this.determineExerciseType(objective, concepts.length, difficultyAssessment);
    
    // 生成练习场景
    const scenario = this.generateScenario(concepts, exerciseType, difficultyAssessment);
    
    // 生成任务描述
    const task = this.generateTask(concepts, objective, exerciseType);
    
    // 生成步骤指导
    const steps = this.generateSteps(concepts, exerciseType, difficultyAssessment);
    
    // 生成提示和反馈
    const hints = this.generateHints(concepts, exerciseType, difficultyAssessment);
    const feedback = this.generateFeedback(concepts, exerciseType);
    
    // 计算难度和时间
    const exerciseDifficulty = this.calculateExerciseDifficulty(concepts.length, exerciseType, difficultyAssessment);
    
    return {
      id: exerciseId,
      title: `练习：应用${conceptNames}`,
      type: exerciseType,
      concepts: concepts.map(c => c.term),
      objective: objective ? objective.text : '应用所学概念',
      scenario,
      task,
      steps,
      hints,
      feedback,
      difficulty: exerciseDifficulty,
      estimatedTime: this.calculateExerciseTime(concepts.length, exerciseType, exerciseDifficulty),
      designPrinciples: ['progressive-disclosure', 'constructive-failure']
    };
  }
  
  /**
   * 确定练习类型
   */
  static determineExerciseType(objective, conceptCount, difficultyAssessment) {
    const bloomLevel = objective ? objective.bloomLevel : '应用';
    const difficulty = difficultyAssessment.overallDifficulty;
    
    // 基于布鲁姆层级和难度选择类型
    const typeMatrix = {
      '记忆': ['recall', 'identification'],
      '理解': ['explanation', 'comparison'],
      '应用': ['problem-solving', 'simulation'],
      '分析': ['analysis', 'deconstruction'],
      '评价': ['evaluation', 'critique'],
      '创造': ['creation', 'design']
    };
    
    const availableTypes = typeMatrix[bloomLevel] || typeMatrix['应用'];
    
    // 根据难度选择具体类型
    if (difficulty >= 8 && availableTypes.includes('design')) {
      return 'design';
    } else if (difficulty >= 6 && availableTypes.includes('problem-solving')) {
      return 'problem-solving';
    } else if (difficulty >= 4 && availableTypes.includes('analysis')) {
      return 'analysis';
    } else {
      return availableTypes[0];
    }
  }
  
  /**
   * 生成练习场景
   */
  static generateScenario(concepts, exerciseType, difficultyAssessment) {
    const mainConcept = concepts[0];
    const conceptName = mainConcept ? mainConcept.term : '相关概念';
    
    const scenarios = {
      'problem-solving': [
        `你是一名工程师，需要解决一个涉及"${conceptName}"的技术问题。`,
        `作为分析师，你面临一个需要使用"${conceptName}"进行分析的案例。`,
        `在项目中，你需要应用"${conceptName}"来解决实际挑战。`
      ],
      'simulation': [
        `你正在模拟一个包含"${conceptName}"的系统运行。`,
        `通过仿真实验观察"${conceptName}"在不同条件下的表现。`,
        `在虚拟环境中测试"${conceptName}"的应用效果。`
      ],
      'analysis': [
        `你需要分析一个包含"${conceptName}"的复杂案例。`,
        `作为研究员，你正在研究"${conceptName}"的影响因素。`,
        `对涉及"${conceptName}"的数据进行深入分析。`
      ],
      'design': [
        `设计一个基于"${conceptName}"的创新解决方案。`,
        `创建应用"${conceptName}"的新系统或流程。`,
        `规划整合"${conceptName}"的项目方案。`
      ],
      'explanation': [
        `向团队成员解释"${conceptName}"的核心要点。`,
        `撰写关于"${conceptName}"的简明指南。`,
        `用通俗语言描述"${conceptName}"的关键特征。`
      ]
    };
    
    const scenarioSet = scenarios[exerciseType] || scenarios['problem-solving'];
    return scenarioSet[Math.floor(Math.random() * scenarioSet.length)];
  }
  
  /**
   * 生成任务描述
   */
  static generateTask(concepts, objective, exerciseType) {
    const mainConcept = concepts[0];
    const conceptName = mainConcept ? mainConcept.term : '相关概念';
    const objectiveText = objective ? objective.text : '掌握并应用概念';
    
    const tasks = {
      'problem-solving': `运用"${conceptName}"解决以下问题，达成"${objectiveText}"的目标。`,
      'simulation': `在模拟环境中应用"${conceptName}"，验证其效果和限制。`,
      'analysis': `分析以下案例中"${conceptName}"的作用和影响。`,
      'design': `基于"${conceptName}"设计一个创新方案，体现"${objectiveText}"的要求。`,
      'explanation': `用你自己的话解释"${conceptName}"，确保准确传达核心思想。`
    };
    
    return tasks[exerciseType] || tasks['problem-solving'];
  }
  
  /**
   * 生成步骤指导
   */
  static generateSteps(concepts, exerciseType, difficultyAssessment) {
    const steps = [];
    const stepCount = this.determineStepCount(concepts.length, exerciseType, difficultyAssessment);
    
    // 通用步骤框架
    const stepTemplates = [
      '理解问题/任务要求',
      '识别关键信息和约束条件',
      '制定解决方案/分析框架',
      '应用相关概念和原理',
      '执行计算/分析/设计',
      '验证结果和反思过程',
      '总结学习和改进建议'
    ];
    
    // 根据练习类型调整步骤
    const typeSpecificTemplates = {
      'problem-solving': ['明确问题', '分析原因', '提出方案', '实施方案', '评估效果'],
      'analysis': ['收集数据', '整理信息', '识别模式', '得出结论', '提出建议'],
      'design': ['确定需求', '生成创意', '设计方案', '测试原型', '优化完善']
    };
    
    const templates = typeSpecificTemplates[exerciseType] || stepTemplates;
    
    // 选择适当数量的步骤
    const selectedTemplates = templates.slice(0, Math.min(stepCount, templates.length));
    
    // 转换为步骤对象
    selectedTemplates.forEach((template, index) => {
      steps.push({
        step: index + 1,
        description: template,
        guidance: this.generateStepGuidance(template, concepts, index, selectedTemplates.length)
      });
    });
    
    return steps;
  }
  
  /**
   * 生成步骤指导详情
   */
  static generateStepGuidance(template, concepts, stepIndex, totalSteps) {
    const mainConcept = concepts[0];
    
    const guidanceTemplates = [
      `思考${template}的关键要素。`,
      `运用"${mainConcept ? mainConcept.term : '相关概念'}"来指导这一步。`,
      `这一步是整个过程的基础，确保理解准确。`,
      `考虑可能的影响因素和约束条件。`,
      `记录你的思考过程和决策依据。`,
      `这一步完成后，准备进入下一步。`
    ];
    
    return guidanceTemplates[stepIndex % guidanceTemplates.length];
  }
  
  /**
   * 生成提示
   */
  static generateHints(concepts, exerciseType, difficultyAssessment) {
    const hints = [];
    const mainConcept = concepts[0];
    
    // 通用提示
    const baseHints = [
      '回顾相关概念的定义和关键特征。',
      '思考类似情境下的应用案例。',
      '分步骤解决问题，不要急于求成。',
      '检查每个步骤的逻辑一致性。'
    ];
    
    // 类型特定提示
    const typeSpecificHints = {
      'problem-solving': ['明确问题边界', '考虑多种解决方案', '评估每个方案的优缺点'],
      'analysis': ['注意数据质量', '识别潜在偏见', '考虑替代解释'],
      'design': ['关注用户需求', '考虑可行性', '迭代改进设计']
    };
    
    // 组合提示
    hints.push(...baseHints.slice(0, 2));
    
    if (typeSpecificHints[exerciseType]) {
      hints.push(...typeSpecificHints[exerciseType].slice(0, 2));
    }
    
    // 根据难度调整提示详细程度
    if (difficultyAssessment.overallDifficulty >= 8) {
      hints.push('高难度任务需要更多耐心和细致分析。');
      hints.push('遇到困难时，尝试分解为更小的子问题。');
    }
    
    // 添加概念相关提示
    if (mainConcept && mainConcept.definition) {
      hints.push(`记住："${mainConcept.term}"指的是${mainConcept.definition}。`);
    }
    
    return hints.map((hint, index) => ({
      id: `hint_${index + 1}`,
      text: hint,
      level: index < 2 ? 'general' : 'specific'
    }));
  }
  
  /**
   * 生成反馈
   */
  static generateFeedback(concepts, exerciseType) {
    const mainConcept = concepts[0];
    const conceptName = mainConcept ? mainConcept.term : '相关概念';
    
    const feedbackTemplates = {
      success: [
        `优秀！你成功应用了"${conceptName}"解决问题。`,
        `很好！你的分析和应用体现了对"${conceptName}"的深入理解。`,
        `完成得很好！这次练习巩固了你对"${conceptName}"的掌握。`
      ],
      partial: [
        `不错！你掌握了主要部分，但还有一些细节可以完善。`,
        `基本正确，可以进一步优化应用"${conceptName}"的方式。`,
        `完成了主要任务，但深入分析还可以加强。`
      ],
      improvement: [
        `需要进一步理解"${conceptName}"的核心要点。`,
        `建议回顾相关概念后再次尝试。`,
        `练习暴露了一些理解上的差距，这是学习的机会。`
      ]
    };
    
    return {
      success: feedbackTemplates.success[Math.floor(Math.random() * feedbackTemplates.success.length)],
      partial: feedbackTemplates.partial[Math.floor(Math.random() * feedbackTemplates.partial.length)],
      improvement: feedbackTemplates.improvement[Math.floor(Math.random() * feedbackTemplates.improvement.length)]
    };
  }
  
  /**
   * 计算练习难度
   */
  static calculateExerciseDifficulty(conceptCount, exerciseType, difficultyAssessment) {
    let baseDifficulty = difficultyAssessment.overallDifficulty;
    
    // 练习类型难度调整
    const typeDifficulty = {
      'explanation': -1,
      'simulation': 0,
      'analysis': 1,
      'problem-solving': 1,
      'design': 2
    };
    
    baseDifficulty += typeDifficulty[exerciseType] || 0;
    
    // 概念数量影响
    if (conceptCount > 3) baseDifficulty += 1;
    
    return Math.max(1, Math.min(10, baseDifficulty));
  }
  
  /**
   * 计算预计时间
   */
  static calculateExerciseTime(conceptCount, exerciseType, exerciseDifficulty) {
    const baseTime = 5; // 分钟
    const typeMultiplier = {
      'explanation': 0.8,
      'simulation': 1.2,
      'analysis': 1.5,
      'problem-solving': 1.8,
      'design': 2.0
    }[exerciseType] || 1.5;
    
    const conceptMultiplier = 1 + (conceptCount - 1) * 0.3;
    const difficultyMultiplier = 1 + (exerciseDifficulty - 5) * 0.15;
    
    return Math.round(baseTime * typeMultiplier * conceptMultiplier * difficultyMultiplier);
  }
  
  /**
   * 确定步骤数量
   */
  static determineStepCount(conceptCount, exerciseType, difficultyAssessment) {
    const baseSteps = Math.min(conceptCount + 2, 7);
    
    // 练习类型影响
    const typeAdjustment = {
      'explanation': -1,
      'simulation': 0,
      'analysis': 1,
      'problem-solving': 1,
      'design': 2
    }[exerciseType] || 0;
    
    // 难度影响
    const difficultyAdjustment = Math.floor(difficultyAssessment.overallDifficulty / 3);
    
    return Math.max(3, Math.min(baseSteps + typeAdjustment + difficultyAdjustment, 8));
  }
  
  /**
   * 查找相关学习目标
   */
  static findRelatedObjective(learningObjectives, conceptGroup, index) {
    if (!learningObjectives || learningObjectives.length === 0) return null;
    
    // 简单匹配：使用索引或概念匹配
    if (index < learningObjectives.length) {
      return learningObjectives[index];
    }
    
    // 尝试概念匹配
    if (conceptGroup.length > 0) {
      const mainConcept = conceptGroup[0];
      const related = learningObjectives.find(obj => 
        obj.text && mainConcept.term && obj.text.includes(mainConcept.term.substring(0, 3))
      );
      
      if (related) return related;
    }
    
    // 返回第一个目标
    return learningObjectives[0];
  }
  
  /**
   * 创建默认练习
   */
  static createDefaultExercise() {
    return {
      id: 'exercise_default',
      title: '基础应用练习',
      type: 'problem-solving',
      concepts: ['基础概念'],
      objective: '应用所学知识解决问题',
      scenario: '你需要应用所学概念解决一个基础问题。',
      task: '运用相关知识完成以下练习，巩固理解。',
      steps: [
        { step: 1, description: '理解问题要求', guidance: '仔细阅读问题描述。' },
        { step: 2, description: '应用相关概念', guidance: '思考如何运用所学概念。' },
        { step: 3, description: '验证解决方案', guidance: '检查答案是否合理。' }
      ],
      hints: [
        { id: 'hint_1', text: '回顾相关概念的定义。', level: 'general' },
        { id: 'hint_2', text: '分步骤解决问题。', level: 'general' }
      ],
      feedback: {
        success: '很好！你完成了基础练习。',
        partial: '基本正确，可以进一步完善。',
        improvement: '需要加强理解，建议回顾概念。'
      },
      difficulty: 5,
      estimatedTime: 5,
      designPrinciples: ['progressive-disclosure']
    };
  }
}

module.exports = InteractiveExerciseGenerator;