/**
 * 对话驱动器 - 将JSON互动学习数据转换为AI对话格式
 * 
 * 将结构化学习模块转换为AI友好的对话流，支持渐进式交互、
 * 分支选择、即时反馈和自适应调整。
 */

class ConversationDriver {
  /**
   * 将互动学习设计转换为AI对话脚本
   * @param {Object} interactiveDesign - 互动学习设计（JSON结构）
   * @param {Object} options - 转换选项
   * @returns {Promise<Array>} AI对话消息数组
   */
  static async convertToConversation(interactiveDesign, options = {}) {
    console.log('将互动学习设计转换为AI对话脚本');
    
    const {
      includeMetadata = true,
      includeHints = true,
      adaptiveMode = true,
      maxMessages = 50
    } = options;
    
    const messages = [];
    
    // 1. 添加欢迎消息
    messages.push(this.createWelcomeMessage(interactiveDesign));
    
    // 2. 按模块顺序转换
    const modules = interactiveDesign.content?.modules || [];
    let currentModuleIndex = 0;
    
    while (currentModuleIndex < modules.length && messages.length < maxMessages) {
      const module = modules[currentModuleIndex];
      const moduleMessages = await this.convertModuleToMessages(
        module,
        interactiveDesign,
        { includeHints, adaptiveMode }
      );
      
      messages.push(...moduleMessages);
      currentModuleIndex++;
      
      // 添加模块间过渡
      if (currentModuleIndex < modules.length) {
        messages.push(this.createTransitionMessage(currentModuleIndex, modules.length));
      }
    }
    
    // 3. 添加结束消息
    messages.push(this.createCompletionMessage(interactiveDesign, currentModuleIndex));
    
    // 4. 添加元数据（可选）
    if (includeMetadata) {
      messages.push(this.createMetadataMessage(interactiveDesign));
    }
    
    return messages.slice(0, maxMessages);
  }
  
  /**
   * 创建欢迎消息
   */
  static createWelcomeMessage(interactiveDesign) {
    const title = interactiveDesign.metadata?.title || '互动学习体验';
    const moduleCount = interactiveDesign.content?.modules?.length || 0;
    const conceptCount = interactiveDesign.content?.concepts?.length || 0;
    
    return {
      role: 'assistant',
      type: 'welcome',
      content: `欢迎开始"${title}"学习之旅！\n\n` +
               `本次学习包含 ${moduleCount} 个互动模块，涵盖 ${conceptCount} 个核心概念。\n` +
               `我将作为你的学习助手，引导你通过渐进式学习掌握这些知识。\n\n` +
               `学习过程中，你可以：\n` +
               `• 回答问题并立即获得反馈\n` +
               `• 请求提示和额外帮助\n` +
               `• 按照自己的节奏学习\n\n` +
               `准备好了吗？让我们开始吧！`,
      metadata: {
        title,
        moduleCount,
        conceptCount,
        designPrinciples: interactiveDesign.design?.designPrinciples || []
      }
    };
  }
  
  /**
   * 将模块转换为消息序列
   */
  static async convertModuleToMessages(module, interactiveDesign, options) {
    const messages = [];
    
    // 添加模块标题
    messages.push({
      role: 'assistant',
      type: 'module_intro',
      content: `## ${module.title}\n\n` +
               `模块类型：${this.getModuleTypeName(module.type)}\n` +
               `预计时间：${module.estimatedTime || 5}分钟\n` +
               `难度：${this.getDifficultyDescription(module.difficulty || 5)}`,
      moduleId: module.id
    });
    
    // 根据模块类型处理
    switch (module.type) {
      case 'dialogue':
        messages.push(...this.convertDialogueModule(module, options));
        break;
      case 'quiz':
        messages.push(...this.convertQuizModule(module, options));
        break;
      case 'exercise':
        messages.push(...this.convertExerciseModule(module, options));
        break;
      default:
        messages.push({
          role: 'assistant',
          type: 'content',
          content: module.content || '学习内容加载中...'
        });
    }
    
    // 添加模块总结
    messages.push({
      role: 'assistant',
      type: 'module_summary',
      content: `完成！你已掌握本模块的核心内容。`,
      moduleId: module.id
    });
    
    return messages;
  }
  
  /**
   * 转换对话模块
   */
  static convertDialogueModule(module, options) {
    const messages = [];
    const dialogue = module.dialogue;
    
    if (!dialogue) return messages;
    
    // 介绍
    if (dialogue.introduction) {
      messages.push({
        role: 'assistant',
        type: 'dialogue_intro',
        content: dialogue.introduction
      });
    }
    
    // 探索部分
    if (dialogue.exploration) {
      messages.push({
        role: 'assistant',
        type: 'dialogue_exploration',
        content: dialogue.exploration
      });
    }
    
    // 分支选择点
    if (dialogue.branches && dialogue.branches.length > 0) {
      dialogue.branches.forEach(branch => {
        messages.push({
          role: 'assistant',
          type: 'branch_point',
          content: branch.prompt,
          branchId: branch.id,
          options: branch.options?.map(opt => ({
            id: opt.id,
            text: opt.text,
            isCorrect: opt.isCorrect
          })) || []
        });
      });
    }
    
    // 结论
    if (dialogue.conclusion) {
      messages.push({
        role: 'assistant',
        type: 'dialogue_conclusion',
        content: dialogue.conclusion
      });
    }
    
    return messages;
  }
  
  /**
   * 转换选择题模块
   */
  static convertQuizModule(module, options) {
    const messages = [];
    const quiz = module.quiz;
    
    if (!quiz) return messages;
    
    // 题目
    messages.push({
      role: 'assistant',
      type: 'quiz_question',
      content: `### 知识检查点\n\n` +
               `${quiz.questionStem}`,
      quizId: module.id,
      questionType: quiz.questionType,
      options: quiz.options?.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect
      })) || [],
      correctAnswers: quiz.correctAnswers,
      // 新设计原则字段
      maxAttempts: quiz.maxAttempts || 1,
      progressiveHints: options.includeHints ? quiz.progressiveHints : [],
      adaptiveMetadata: options.adaptiveMode ? quiz.adaptiveMetadata : null
    });
    
    // 如果包含渐进提示，添加提示可用性说明
    if (options.includeHints && quiz.progressiveHints && quiz.progressiveHints.length > 0) {
      messages.push({
        role: 'assistant',
        type: 'hint_availability',
        content: `💡 提示：如果你需要帮助，可以请求提示。每个问题最多可尝试${quiz.maxAttempts || 1}次。`,
        hintLevels: quiz.progressiveHints.length
      });
    }
    
    return messages;
  }
  
  /**
   * 转换练习模块
   */
  static convertExerciseModule(module, options) {
    const messages = [];
    const exercise = module.exercise;
    
    if (!exercise) return messages;
    
    // 场景介绍
    messages.push({
      role: 'assistant',
      type: 'exercise_scenario',
      content: `### 实践练习\n\n` +
               `**场景**：${exercise.scenario || '应用所学知识解决实际问题'}\n\n` +
               `**任务**：${exercise.task || '完成指定练习'}`
    });
    
    // 步骤指导
    if (exercise.steps && exercise.steps.length > 0) {
      messages.push({
        role: 'assistant',
        type: 'exercise_steps',
        content: `**练习步骤**：\n\n` +
                 exercise.steps.map((step, idx) => 
                   `${idx + 1}. ${step.description}${step.guidance ? `\n   💡 ${step.guidance}` : ''}`
                 ).join('\n\n')
      });
    }
    
    // 提示
    if (options.includeHints && exercise.hints && exercise.hints.length > 0) {
      messages.push({
        role: 'assistant',
        type: 'exercise_hints',
        content: `**可用提示**：\n\n` +
                 exercise.hints.map(hint => 
                   `• ${hint.text}${hint.level ? ` (级别：${hint.level})` : ''}`
                 ).join('\n')
      });
    }
    
    return messages;
  }
  
  /**
   * 创建过渡消息
   */
  static createTransitionMessage(currentIndex, totalCount) {
    const progress = Math.round((currentIndex / totalCount) * 100);
    
    return {
      role: 'assistant',
      type: 'transition',
      content: `---\n\n` +
               `**学习进度**：${currentIndex}/${totalCount} (${progress}%)\n\n` +
               `准备好继续下一个模块了吗？`,
      progress,
      currentModule: currentIndex,
      totalModules: totalCount
    };
  }
  
  /**
   * 创建完成消息
   */
  static createCompletionMessage(interactiveDesign, completedCount) {
    const title = interactiveDesign.metadata?.title || '互动学习体验';
    const totalCount = interactiveDesign.content?.modules?.length || 0;
    
    return {
      role: 'assistant',
      type: 'completion',
      content: `🎉 恭喜！你已完成"${title}"的所有学习模块。\n\n` +
               `**学习总结**：\n` +
               `• 完成模块：${completedCount}/${totalCount}\n` +
               `• 学习时间：约${interactiveDesign.analytics?.estimatedLearningTime || 30}分钟\n` +
               `• 掌握概念：${interactiveDesign.content?.concepts?.length || 0}个\n\n` +
               `你已经掌握了相关知识和技能。继续保持学习热情！`,
      metadata: {
        completed: true,
        completedAt: new Date().toISOString(),
        completedModules: completedCount
      }
    };
  }
  
  /**
   * 创建元数据消息
   */
  static createMetadataMessage(interactiveDesign) {
    return {
      role: 'system',
      type: 'metadata',
      content: JSON.stringify({
        designPrinciplesApplied: interactiveDesign.design?.designPrinciples || [],
        difficulty: interactiveDesign.design?.difficulty || {},
        conceptProgression: interactiveDesign.progression?.conceptProgression || {},
        analytics: interactiveDesign.analytics || {}
      }, null, 2)
    };
  }
  
  /**
   * 获取模块类型名称
   */
  static getModuleTypeName(type) {
    const names = {
      'dialogue': '引导式对话',
      'quiz': '知识检查点',
      'exercise': '实践练习',
      'simulation': '模拟实践'
    };
    
    return names[type] || type;
  }
  
  /**
   * 获取难度描述
   */
  static getDifficultyDescription(difficulty) {
    if (difficulty <= 3) return '简单';
    if (difficulty <= 6) return '中等';
    if (difficulty <= 8) return '挑战';
    return '高难度';
  }
  
  /**
   * 处理用户响应
   */
  static processUserResponse(message, currentModule, interactiveDesign) {
    // 根据用户消息类型提供相应反馈
    // 这是一个简化版本，实际实现需要更复杂的逻辑
    
    const response = {
      role: 'assistant',
      type: 'feedback',
      content: '收到你的回答。正在处理...'
    };
    
    // 检查是否是选择题回答
    if (message.type === 'quiz_response') {
      const quiz = currentModule?.quiz;
      if (quiz) {
        const isCorrect = this.checkQuizAnswer(message.answer, quiz);
        response.content = isCorrect ? 
          `✅ 正确！${quiz.feedback || '很好，你掌握了这个知识点。'}` :
          `❌ 不正确。${quiz.feedback || '再想想，或者请求提示。'}`;
        
        response.isCorrect = isCorrect;
        
        // 如果错误且存在渐进提示，提供第一个提示
        if (!isCorrect && quiz.progressiveHints && quiz.progressiveHints.length > 0) {
          response.hint = quiz.progressiveHints[0];
        }
      }
    }
    
    // 检查是否是分支选择
    if (message.type === 'branch_choice') {
      const branch = currentModule?.dialogue?.branches?.find(b => b.id === message.branchId);
      if (branch) {
        const option = branch.options?.find(opt => opt.id === message.optionId);
        if (option) {
          response.content = option.feedback || '选择已记录。';
          response.nextStep = option.nextStep;
        }
      }
    }
    
    return response;
  }
  
  /**
   * 检查选择题答案
   */
  static checkQuizAnswer(userAnswer, quiz) {
    if (!userAnswer || !quiz.correctAnswers) return false;
    
    // 简化检查：用户答案数组与正确答案数组完全匹配
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    const correctAnswers = Array.isArray(quiz.correctAnswers) ? quiz.correctAnswers : [quiz.correctAnswers];
    
    if (userAnswers.length !== correctAnswers.length) return false;
    
    return userAnswers.every(answer => correctAnswers.includes(answer));
  }
}

module.exports = ConversationDriver;