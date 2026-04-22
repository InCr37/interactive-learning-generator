/**
 * 叙事编织器
 * 
 * 将学习点嵌入连贯故事，创建情境化学习体验。
 * 设计叙事框架、角色、场景和学习进展的关联。
 */

class NarrativeWeaver {
  /**
   * 编织叙事框架
   * @param {Array} concepts - 概念数组
   * @param {Array} learningObjectives - 学习目标数组
   * @param {Object} designPrinciples - 教学设计原则
   * @param {Object} options - 编织选项
   * @returns {Promise<Object>} 叙事框架
   */
  static async weave(concepts, learningObjectives, designPrinciples, options = {}) {
    console.log('编织叙事框架');
    
    const neutral = options.neutral !== false;
    
    // 选择叙事主题
    const theme = this.selectNarrativeTheme(concepts, learningObjectives, neutral);
    
    // 创建叙事结构
    const structure = this.createNarrativeStructure(concepts, learningObjectives, designPrinciples);
    
    // 设计角色
    const characters = this.designCharacters(concepts, neutral);
    
    // 构建场景
    const settings = this.buildSettings(concepts, theme, neutral);
    
    // 创建学习进展映射
    const progressMapping = this.mapLearningProgress(concepts, learningObjectives, structure);
    
    // 生成叙事标题
    const title = this.generateNarrativeTitle(concepts, learningObjectives, theme);
    
    return {
      title,
      theme,
      neutral,
      structure,
      characters,
      settings,
      progressMapping,
      designPrinciplesApplied: designPrinciples.appliedPrinciples || [],
      metadata: {
        conceptCount: concepts.length,
        objectiveCount: learningObjectives.length,
        narrativeStyle: neutral ? 'educational-neutral' : 'engaging-metaphorical'
      }
    };
  }
  
  /**
   * 选择叙事主题
   */
  static selectNarrativeTheme(concepts, learningObjectives, neutral) {
    if (!concepts || concepts.length === 0) {
      return neutral ? '知识探索' : '学习冒险';
    }
    
    // 分析概念类型
    const conceptTerms = concepts.map(c => c.term).join(' ');
    
    // 检查学科领域关键词
    const domainKeywords = {
      '数学': ['数', '算', '公式', '几何', '代数', '积分', '微分', '函数', '方程'],
      '科学': ['物', '化', '生', '实验', '观察', '元素', '反应', '细胞', '能量'],
      '技术': ['程序', '代码', '算法', '系统', '网络', '数据', '软件', '硬件'],
      '人文': ['历史', '文化', '社会', '语言', '文学', '艺术', '哲学', '心理'],
      '工程': ['设计', '建造', '结构', '材料', '机械', '电子', '系统', '优化']
    };
    
    // 确定主要领域
    let mainDomain = '通用';
    let maxScore = 0;
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      const score = keywords.reduce((sum, keyword) => 
        sum + (conceptTerms.includes(keyword) ? 1 : 0), 0);
      
      if (score > maxScore) {
        maxScore = score;
        mainDomain = domain;
      }
    }
    
    // 选择主题
    const themes = {
      '数学': {
        neutral: ['数学建模', '问题求解', '逻辑推理'],
        engaging: ['数学王国探险', '公式迷宫破解', '几何世界探索']
      },
      '科学': {
        neutral: ['科学研究', '实验分析', '现象解释'],
        engaging: ['科学实验室冒险', '自然现象解密', '微观世界探索']
      },
      '技术': {
        neutral: ['技术开发', '系统设计', '问题调试'],
        engaging: ['数字世界构建', '代码迷宫穿越', '算法谜题解决']
      },
      '人文': {
        neutral: ['文化分析', '历史研究', '社会观察'],
        engaging: ['时空穿越探索', '文化密码解读', '思想迷宫漫游']
      },
      '工程': {
        neutral: ['工程设计', '问题解决', '方案优化'],
        engaging: ['工程挑战征服', '设计创意实现', '结构奥秘揭示']
      },
      '通用': {
        neutral: ['知识探索', '概念理解', '技能掌握'],
        engaging: ['学习冒险', '知识宝藏寻找', '智慧迷宫穿越']
      }
    };
    
    const domainThemes = themes[mainDomain] || themes['通用'];
    const themeSet = neutral ? domainThemes.neutral : domainThemes.engaging;
    
    return themeSet[Math.floor(Math.random() * themeSet.length)];
  }
  
  /**
   * 创建叙事结构
   */
  static createNarrativeStructure(concepts, learningObjectives, designPrinciples) {
    // 基本三幕结构
    const threeActStructure = {
      act1: {
        name: '建立',
        purpose: '引入情境、角色和初始挑战',
        learningPhase: '概念引入和基础理解'
      },
      act2: {
        name: '发展',
        purpose: '深化学习、面对挑战、应用知识',
        learningPhase: '概念应用和技能发展'
      },
      act3: {
        name: '解决',
        purpose: '综合应用、解决问题、总结学习',
        learningPhase: '综合应用和反思总结'
      }
    };
    
    // 将概念分配到各幕
    const conceptDistribution = this.distributeConceptsToActs(concepts, threeActStructure);
    
    // 将学习目标分配到各幕
    const objectiveDistribution = this.distributeObjectivesToActs(learningObjectives, threeActStructure);
    
    // 创建关键情节点
    const plotPoints = this.createPlotPoints(concepts, learningObjectives, threeActStructure);
    
    // 确定节奏
    const pacing = this.determineNarrativePacing(concepts.length, designPrinciples);
    
    return {
      threeActStructure,
      conceptDistribution,
      objectiveDistribution,
      plotPoints,
      pacing,
      totalActs: 3,
      estimatedDuration: pacing.estimatedDuration
    };
  }
  
  /**
   * 设计角色
   */
  static designCharacters(concepts, neutral) {
    const mainConcept = concepts.length > 0 ? concepts[0].term : '知识';
    
    const characters = {
      learner: {
        role: '学习者',
        description: neutral ? '知识探索者' : '冒险家',
        motivation: '理解和掌握新知识',
        growthArc: '从初学者到掌握者'
      },
      guide: {
        role: neutral ? '学习助手' : '知识向导',
        description: neutral ? '提供指导和解释' : '智慧的引路人',
        expertise: '熟悉学习领域',
        teachingStyle: neutral ? '清晰、系统、耐心' : '启发式、引导式'
      }
    };
    
    // 根据概念添加专家角色
    if (concepts.length > 3) {
      characters.expert = {
        role: neutral ? '领域专家' : '智慧长者',
        description: neutral ? '提供深度见解' : '掌握古老智慧',
        expertise: mainConcept,
        appearanceCondition: '当需要深度解释时'
      };
    }
    
    // 根据概念添加同伴角色
    if (concepts.length > 5) {
      characters.peer = {
        role: neutral ? '学习同伴' : '同行伙伴',
        description: neutral ? '共同学习和讨论' : '一起探索的伙伴',
        function: '提供不同视角和讨论机会'
      };
    }
    
    return characters;
  }
  
  /**
   * 构建场景
   */
  static buildSettings(concepts, theme, neutral) {
    const baseSettings = [];
    
    // 根据主题选择场景
    const themeSettings = {
      '数学建模': ['实验室', '计算中心', '问题解决室'],
      '问题求解': ['工程现场', '设计工作室', '分析室'],
      '科学研究': ['实验室', '观测站', '数据分析中心'],
      '数学王国探险': ['数字森林', '公式城堡', '几何迷宫'],
      '科学实验室冒险': ['微观实验室', '元素反应室', '生物观察站'],
      '知识探索': ['学习空间', '思考角落', '讨论区'],
      '学习冒险': ['知识森林', '智慧山脉', '理解海洋']
    };
    
    // 添加主题相关场景
    if (themeSettings[theme]) {
      baseSettings.push(...themeSettings[theme].slice(0, 2));
    }
    
    // 添加通用场景
    const genericSettings = neutral ? 
      ['学习环境', '练习场地', '评估空间'] :
      ['起始村庄', '挑战关卡', '宝藏密室'];
    
    baseSettings.push(...genericSettings);
    
    // 为每个场景添加描述
    return baseSettings.map((setting, index) => ({
      id: `setting_${index + 1}`,
      name: setting,
      description: this.generateSettingDescription(setting, concepts, neutral),
      purpose: this.determineSettingPurpose(setting, index, baseSettings.length),
      visualStyle: neutral ? '清晰、专业、教育导向' : '生动、隐喻、引人入胜'
    }));
  }
  
  /**
   * 映射学习进展
   */
  static mapLearningProgress(concepts, learningObjectives, narrativeStructure) {
    const progressMap = [];
    
    // 将每个概念映射到叙事位置
    concepts.forEach((concept, index) => {
      const act = this.determineActForConcept(index, concepts.length);
      const positionInAct = this.determinePositionInAct(index % 3);
      
      progressMap.push({
        conceptId: concept.id,
        conceptTerm: concept.term,
        act: act,
        positionInAct: positionInAct,
        narrativeFunction: this.determineNarrativeFunction(concept, index, concepts.length),
        learningCheckpoint: `掌握${concept.term}后进入下一阶段`
      });
    });
    
    // 将学习目标映射到叙事进展
    learningObjectives.forEach((objective, index) => {
      const targetAct = Math.min(Math.floor(index / Math.ceil(learningObjectives.length / 3)) + 1, 3);
      
      progressMap.push({
        objectiveId: objective.id,
        objectiveText: objective.text.substring(0, 50) + '...',
        targetAct: targetAct,
        narrativeMilestone: `完成第${targetAct}幕后应达成此目标`,
        assessmentPoint: `在第${targetAct}幕结束时检查`
      });
    });
    
    return progressMap;
  }
  
  /**
   * 生成叙事标题
   */
  static generateNarrativeTitle(concepts, learningObjectives, theme) {
    if (!concepts || concepts.length === 0) {
      return '学习之旅：从入门到掌握';
    }
    
    const mainConcept = concepts[0].term;
    const objectiveSummary = learningObjectives.length > 0 ? 
      learningObjectives[0].text.substring(0, 20) + '...' : '知识掌握';
    
    const titles = [
      `${theme}：${mainConcept}的探索之旅`,
      `掌握${mainConcept}：${objectiveSummary}`,
      `${theme}中的${mainConcept}学习`,
      `从理解到应用：${mainConcept}学习路径`
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }
  
  // ========== 辅助方法 ==========
  
  static distributeConceptsToActs(concepts, threeActStructure) {
    const distribution = {
      act1: [],
      act2: [],
      act3: []
    };
    
    if (!concepts || concepts.length === 0) return distribution;
    
    // 简单分布：按顺序分到三幕
    const conceptsPerAct = Math.ceil(concepts.length / 3);
    
    concepts.forEach((concept, index) => {
      const actIndex = Math.floor(index / conceptsPerAct) + 1;
      const actKey = `act${actIndex}`;
      
      if (distribution[actKey]) {
        distribution[actKey].push({
          conceptId: concept.id,
          term: concept.term,
          positionInAct: (index % conceptsPerAct) + 1
        });
      } else {
        // 如果超过3幕，分配到第3幕
        distribution.act3.push({
          conceptId: concept.id,
          term: concept.term,
          positionInAct: (index % conceptsPerAct) + 1
        });
      }
    });
    
    return distribution;
  }
  
  static distributeObjectivesToActs(objectives, threeActStructure) {
    const distribution = {
      act1: [],
      act2: [],
      act3: []
    };
    
    if (!objectives || objectives.length === 0) return distribution;
    
    // 根据布鲁姆层级分布
    objectives.forEach((objective, index) => {
      let targetAct = 2; // 默认为第2幕
      
      // 简单启发式：低级目标在第1幕，高级目标在第3幕
      const bloomOrder = ['记忆', '理解', '应用', '分析', '评价', '创造'];
      const bloomIndex = bloomOrder.indexOf(objective.bloomLevel);
      
      if (bloomIndex <= 1) targetAct = 1; // 记忆、理解
      else if (bloomIndex >= 4) targetAct = 3; // 评价、创造
      
      const actKey = `act${targetAct}`;
      distribution[actKey].push({
        objectiveId: objective.id,
        text: objective.text.substring(0, 30) + '...',
        bloomLevel: objective.bloomLevel
      });
    });
    
    return distribution;
  }
  
  static createPlotPoints(concepts, objectives, threeActStructure) {
    const plotPoints = [];
    
    // 第一幕关键点：引入挑战
    plotPoints.push({
      act: 1,
      point: 'inciting-incident',
      name: '激励事件',
      description: '引入学习挑战和初始问题',
      learningPurpose: '激发学习动机，建立学习目标'
    });
    
    // 第二幕关键点：中点转折
    plotPoints.push({
      act: 2,
      point: 'midpoint-turn',
      name: '中点转折',
      description: '学习深化，面临更大挑战',
      learningPurpose: '从基础理解转向应用分析'
    });
    
    // 第三幕关键点：高潮解决
    plotPoints.push({
      act: 3,
      point: 'climax-resolution',
      name: '高潮解决',
      description: '综合应用知识解决问题',
      learningPurpose: '整合学习成果，展示掌握程度'
    });
    
    // 根据概念数量添加额外情节点
    if (concepts.length > 5) {
      plotPoints.push({
        act: 2,
        point: 'subplot-development',
        name: '支线发展',
        description: '探索相关概念或应用场景',
        learningPurpose: '拓展知识广度，建立概念联系'
      });
    }
    
    return plotPoints;
  }
  
  static determineNarrativePacing(conceptCount, designPrinciples) {
    const baseDuration = conceptCount * 3; // 每个概念3分钟
    const hasProgressiveDisclosure = designPrinciples.appliedPrinciples?.includes('progressive-disclosure');
    
    let estimatedDuration = baseDuration;
    let pace = '中等';
    
    if (hasProgressiveDisclosure) {
      estimatedDuration = Math.round(baseDuration * 1.2); // 渐进式揭露需要更多时间
      pace = '渐进';
    }
    
    if (conceptCount > 10) {
      pace = '较慢';
      estimatedDuration = Math.round(baseDuration * 1.3);
    } else if (conceptCount < 5) {
      pace = '较快';
      estimatedDuration = Math.round(baseDuration * 0.8);
    }
    
    return {
      pace,
      estimatedDuration,
      recommendedBreaks: conceptCount > 8 ? 2 : conceptCount > 4 ? 1 : 0,
      sessionLength: Math.min(estimatedDuration, 45) // 单次学习不超过45分钟
    };
  }
  
  static generateSettingDescription(setting, concepts, neutral) {
    const mainConcept = concepts.length > 0 ? concepts[0].term : '知识';
    
    const descriptions = {
      '实验室': neutral ? 
        `进行实验和观察的科学环境，专注于${mainConcept}的研究。` :
        `充满神奇仪器和实验设备的探索空间，揭示${mainConcept}的奥秘。`,
      '学习空间': `专注学习的环境，适合深入理解${mainConcept}。`,
      '知识森林': `隐喻的学习环境，每棵树代表一个概念，${mainConcept}是其中最突出的一棵。`,
      '设计工作室': `创意和实践结合的空间，在这里应用${mainConcept}解决实际问题。`
    };
    
    return descriptions[setting] || 
      (neutral ? 
        `专注于学习${mainConcept}的环境。` :
        `探索${mainConcept}的奇妙场所。`);
  }
  
  static determineSettingPurpose(setting, index, totalSettings) {
    if (index === 0) return '起始和引入';
    if (index === totalSettings - 1) return '总结和评估';
    if (index < totalSettings / 2) return '学习和发展';
    return '应用和深化';
  }
  
  static determineActForConcept(conceptIndex, totalConcepts) {
    const portion = conceptIndex / totalConcepts;
    if (portion < 0.33) return 1;
    if (portion < 0.67) return 2;
    return 3;
  }
  
  static determinePositionInAct(positionIndex) {
    const positions = ['初期', '中期', '后期'];
    return positions[positionIndex] || '中期';
  }
  
  static determineNarrativeFunction(concept, index, totalConcepts) {
    if (index === 0) return '核心概念引入';
    if (index === totalConcepts - 1) return '学习成果综合';
    if (index < totalConcepts / 3) return '基础概念建立';
    if (index < totalConcepts * 2 / 3) return '知识扩展深化';
    return '综合应用准备';
  }
}

module.exports = NarrativeWeaver;