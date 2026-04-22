/**
 * 分支对话生成器
 * 
 * 创建引导式问答对话，模拟学习助手指导。
 * 生成分支选择点，每个选择导致不同的学习路径和反馈。
 */

class BranchingDialogueGenerator {
  /**
   * 生成分支对话
   * @param {Array} concepts - 概念数组
   * @param {Object} narrativeFramework - 叙事框架
   * @param {Object} difficultyAssessment - 难度评估结果
   * @param {Object} options - 生成选项
   * @returns {Promise<Array>} 分支对话数组
   */
  static async generate(concepts, narrativeFramework, difficultyAssessment, options = {}) {
    console.log('生成分支对话');
    
    const neutral = options.neutral !== false;
    const dialogues = [];
    
    // 如果没有概念，生成默认对话
    if (!concepts || concepts.length === 0) {
      return [this.createDefaultDialogue(narrativeFramework, neutral)];
    }
    
    // 根据概念数量决定对话数量
    const dialogueCount = Math.min(Math.ceil(concepts.length / 2), 5);
    
    // 为每组概念生成对话
    for (let i = 0; i < dialogueCount; i++) {
      const startIdx = i * Math.ceil(concepts.length / dialogueCount);
      const endIdx = Math.min(startIdx + Math.ceil(concepts.length / dialogueCount), concepts.length);
      const conceptGroup = concepts.slice(startIdx, endIdx);
      
      const dialogue = await this.createDialogueForConcepts(
        conceptGroup,
        narrativeFramework,
        difficultyAssessment,
        neutral,
        i
      );
      
      if (dialogue) {
        dialogues.push(dialogue);
      }
    }
    
    return dialogues;
  }
  
  /**
   * 为概念组创建对话
   */
  static async createDialogueForConcepts(concepts, narrativeFramework, difficultyAssessment, neutral, index) {
    if (!concepts || concepts.length === 0) return null;
    
    const mainConcept = concepts[0];
    const dialogueId = `dialogue_${index + 1}`;
    
    // 确定对话主题和角色
    const topic = mainConcept.term || '核心概念';
    const guideName = neutral ? '学习助手' : '知识向导';
    const learnerName = '学习者';
    
    // 构建对话内容
    const introduction = this.generateIntroduction(topic, narrativeFramework, guideName, learnerName);
    const exploration = this.generateExploration(concepts, guideName, learnerName);
    const branches = this.generateBranches(concepts, difficultyAssessment, neutral);
    const conclusion = this.generateConclusion(topic, concepts.length, guideName);
    
    return {
      id: dialogueId,
      title: `探索：${topic}`,
      topic,
      concepts: concepts.map(c => c.term),
      introduction,
      exploration,
      branches,
      conclusion,
      designPrinciples: ['progressive-disclosure', 'contextual-narrative'],
      estimatedTime: this.calculateDialogueTime(concepts.length, difficultyAssessment.overallDifficulty),
      neutralInterface: neutral
    };
  }
  
  /**
   * 生成对话介绍
   */
  static generateIntroduction(topic, narrativeFramework, guideName, learnerName) {
    const scenarios = [
      `${guideName}：你好${learnerName}！今天我们来探索"${topic}"这个概念。`,
      `${guideName}：欢迎来到学习旅程的下一站，我们将一起研究"${topic}"。`,
      `${guideName}：让我们开始了解"${topic}"，这是一个非常重要的概念。`
    ];
    
    const followUps = [
      `你之前对这个概念有什么了解吗？`,
      `听到"${topic}"这个词，你首先想到的是什么？`,
      `你觉得"${topic}"可能会在什么情境下应用？`
    ];
    
    return {
      guide: scenarios[Math.floor(Math.random() * scenarios.length)],
      prompt: followUps[Math.floor(Math.random() * followUps.length)],
      context: narrativeFramework.scenario ? `场景：${narrativeFramework.scenario}` : ''
    };
  }
  
  /**
   * 生成探索部分
   */
  static generateExploration(concepts, guideName, learnerName) {
    if (concepts.length === 0) return '';
    
    const explorationTexts = [];
    
    concepts.forEach((concept, index) => {
      if (concept.definition) {
        explorationTexts.push(`${guideName}："${concept.term}"指的是${concept.definition}。`);
      } else {
        explorationTexts.push(`${guideName}：让我们来了解"${concept.term}"这个概念。`);
      }
      
      // 添加交互点
      if (index < concepts.length - 1) {
        const questions = [
          `${learnerName}：我理解了，那么...`,
          `${learnerName}：这让我想到另一个问题...`,
          `${learnerName}：这个和之前的概念有什么联系吗？`
        ];
        explorationTexts.push(questions[index % questions.length]);
      }
    });
    
    return explorationTexts.join('\n');
  }
  
  /**
   * 生成分支选择点
   */
  static generateBranches(concepts, difficultyAssessment, neutral) {
    const branches = [];
    const mainConcept = concepts[0];
    
    // 分支1：理解程度检查
    branches.push({
      id: 'branch_1',
      prompt: `关于"${mainConcept.term}"，你觉得自己理解得如何？`,
      options: [
        {
          id: 'option_1_1',
          text: '完全理解，可以继续前进',
          feedback: neutral ? 
            '很好！扎实的理解是后续学习的基础。' :
            '太棒了！你已经掌握了核心要点。',
          nextStep: '继续学习下一个概念',
          isCorrect: true
        },
        {
          id: 'option_1_2',
          text: '基本理解，但还有些疑问',
          feedback: neutral ?
            '有疑问是学习的正常过程。让我们再仔细看看...' :
            '疑问是探索的开始！我们一起深入看看...',
          nextStep: '进一步解释和示例',
          isCorrect: true
        },
        {
          id: 'option_1_3',
          text: '不太理解，需要更多解释',
          feedback: neutral ?
            '没问题，我们用不同的方式来理解这个概念。' :
            '让我们换个角度，用更简单的方式来看...',
          nextStep: '基础解释和简单示例',
          isCorrect: true
        }
      ]
    });
    
    // 分支2：应用场景选择
    if (concepts.length > 1) {
      branches.push({
        id: 'branch_2',
        prompt: `你想通过什么方式来应用"${mainConcept.term}"？`,
        options: [
          {
            id: 'option_2_1',
            text: '解决一个实际问题',
            feedback: '实际问题能帮助我们理解概念的实际价值。',
            nextStep: '进入问题解决练习',
            isCorrect: true
          },
          {
            id: 'option_2_2', 
            text: '分析一个相关案例',
            feedback: '案例分析能展示概念在真实情境中的应用。',
            nextStep: '进入案例分析',
            isCorrect: true
          },
          {
            id: 'option_2_3',
            text: '与其他概念进行比较',
            feedback: '比较能帮助我们理解概念的独特性和关联性。',
            nextStep: '进入概念比较',
            isCorrect: true
          }
        ]
      });
    }
    
    // 根据难度添加挑战性分支
    if (difficultyAssessment.overallDifficulty >= 7) {
      branches.push({
        id: 'branch_challenge',
        prompt: `关于"${mainConcept.term}"，有一个常见的误解是：`,
        options: [
          {
            id: 'option_c_1',
            text: '它只能应用于特定情境',
            feedback: '这是一个常见误解。实际上，这个概念的应用范围更广...',
            nextStep: '解释应用范围的普遍性',
            isCorrect: false
          },
          {
            id: 'option_c_2',
            text: '它总是与另一个概念同时出现',
            feedback: '不一定。虽然它们经常关联，但也可以独立存在...',
            nextStep: '解释概念间的独立性和关联性',
            isCorrect: false
          },
          {
            id: 'option_c_3',
            text: '它的定义是固定不变的',
            feedback: '概念的理解可能会随着情境和视角而变化...',
            nextStep: '讨论概念的动态性',
            isCorrect: false
          }
        ]
      });
    }
    
    return branches;
  }
  
  /**
   * 生成对话结论
   */
  static generateConclusion(topic, conceptCount, guideName) {
    const conclusions = [
      `${guideName}：今天我们学习了关于"${topic}"的${conceptCount}个相关概念。`,
      `${guideName}：对"${topic}"的探索告一段落，希望这次学习对你有所帮助。`,
      `${guideName}：我们已经完成了"${topic}"部分的学习，接下来可以继续前进或回顾巩固。`
    ];
    
    const nextSteps = [
      '接下来，我们将进入练习环节巩固理解。',
      '你可以选择继续学习下一个主题，或回顾刚学的内容。',
      '建议花几分钟时间思考一下这些概念的实际应用。'
    ];
    
    return {
      summary: conclusions[Math.floor(Math.random() * conclusions.length)],
      nextStep: nextSteps[Math.floor(Math.random() * nextSteps.length)]
    };
  }
  
  /**
   * 计算对话预计时间
   */
  static calculateDialogueTime(conceptCount, difficulty) {
    const baseTime = conceptCount * 1.5; // 每个概念1.5分钟
    const difficultyAdjustment = difficulty * 0.2;
    return Math.round(baseTime + difficultyAdjustment);
  }
  
  /**
   * 创建默认对话
   */
  static createDefaultDialogue(narrativeFramework, neutral) {
    const guideName = neutral ? '学习助手' : '知识向导';
    
    return {
      id: 'dialogue_default',
      title: '欢迎学习',
      topic: '学习开始',
      concepts: ['欢迎'],
      introduction: {
        guide: `${guideName}：欢迎开始学习之旅！`,
        prompt: '你准备好开始探索新知识了吗？',
        context: narrativeFramework.scenario || '学习空间'
      },
      exploration: `${guideName}：我们将一起探索有趣的知识领域。\n学习者：我很期待！`,
      branches: [
        {
          id: 'branch_default',
          prompt: '你想从哪里开始？',
          options: [
            {
              id: 'option_default_1',
              text: '从基础概念开始',
              feedback: '很好的选择！打好基础很重要。',
              nextStep: '进入基础概念学习',
              isCorrect: true
            },
            {
              id: 'option_default_2',
              text: '通过实例学习',
              feedback: '实例能帮助我们直观理解。',
              nextStep: '进入实例学习',
              isCorrect: true
            },
            {
              id: 'option_default_3',
              text: '先了解学习目标',
              feedback: '明确目标能帮助我们更有方向地学习。',
              nextStep: '查看学习目标',
              isCorrect: true
            }
          ]
        }
      ],
      conclusion: {
        summary: `${guideName}：学习之旅即将开始。`,
        nextStep: '让我们迈出第一步吧！'
      },
      designPrinciples: ['contextual-narrative'],
      estimatedTime: 5,
      neutralInterface: neutral
    };
  }
}

module.exports = BranchingDialogueGenerator;