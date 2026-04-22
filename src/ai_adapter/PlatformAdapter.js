/**
 * 平台适配器 - 将通用AI对话消息适配到不同AI平台
 * 
 * 支持平台：
 * - workbuddy: WorkBuddy AI助手平台（当前默认）
 * - claude: Anthropic Claude API格式
 * - openai: OpenAI ChatGPT API格式
 * - generic: 通用JSON格式（默认备用）
 * 
 * 处理平台特定限制：
 * - 最大消息长度
 * - 支持的消息类型
 * - 交互元素格式
 * - 系统提示词规范
 */

class PlatformAdapter {
  /**
   * 将通用对话消息适配到目标平台
   * @param {Array} messages - 通用对话消息数组（来自ConversationDriver）
   * @param {Object} options - 适配选项
   * @returns {Promise<Array>} 平台特定的消息数组
   */
  static async adapt(messages, options = {}) {
    const {
      platform = 'workbuddy',
      maxMessageLength = 4000,
      includeSystemPrompt = true,
      userContext = null
    } = options;

    // 1. 验证和清理消息
    const validatedMessages = this.validateMessages(messages);
    
    // 2. 根据平台选择适配器
    let adaptedMessages;
    switch (platform.toLowerCase()) {
      case 'workbuddy':
        adaptedMessages = this.adaptToWorkBuddy(validatedMessages, { maxMessageLength, userContext });
        break;
      case 'claude':
        adaptedMessages = this.adaptToClaude(validatedMessages, { maxMessageLength, includeSystemPrompt });
        break;
      case 'openai':
        adaptedMessages = this.adaptToOpenAI(validatedMessages, { maxMessageLength, includeSystemPrompt });
        break;
      case 'generic':
      default:
        adaptedMessages = this.adaptToGeneric(validatedMessages, { maxMessageLength });
        break;
    }

    // 3. 应用长度限制
    const finalMessages = this.applyLengthLimits(adaptedMessages, maxMessageLength);
    
    // 4. 添加平台元数据
    return this.addPlatformMetadata(finalMessages, platform);
  }

  /**
   * 验证和清理消息数组
   */
  static validateMessages(messages) {
    if (!Array.isArray(messages)) {
      throw new Error('messages必须是数组');
    }

    return messages.filter(msg => {
      // 基本验证
      if (!msg || typeof msg !== 'object') return false;
      if (!msg.content || typeof msg.content !== 'string') return false;
      
      // 确保必要的字段存在
      msg.role = msg.role || 'assistant';
      msg.type = msg.type || 'text';
      
      return true;
    });
  }

  /**
   * 适配到WorkBuddy平台
   */
  static adaptToWorkBuddy(messages, options = {}) {
    const { maxMessageLength, userContext } = options;
    const adapted = [];

    // WorkBuddy支持的消息格式相对灵活
    // 可以包含丰富的元数据和交互元素
    messages.forEach((msg, index) => {
      const baseMessage = {
        role: this.mapRoleToWorkBuddy(msg.role),
        content: msg.content,
        metadata: {
          messageType: msg.type,
          messageIndex: index,
          timestamp: new Date().toISOString(),
          // 保留原始消息的元数据
          originalMetadata: msg.metadata || {},
          // 交互元素
          interactiveElements: this.extractInteractiveElements(msg)
        }
      };

      // 添加用户上下文（如果提供）
      if (userContext && index === 0) {
        baseMessage.metadata.userContext = userContext;
      }

      // 处理特殊消息类型
      switch (msg.type) {
        case 'quiz_question':
          baseMessage.content = this.formatQuizForWorkBuddy(msg);
          break;
        case 'branch_point':
          baseMessage.content = this.formatBranchPointForWorkBuddy(msg);
          break;
        case 'exercise_scenario':
          baseMessage.content = this.formatExerciseForWorkBuddy(msg);
          break;
      }

      adapted.push(baseMessage);
    });

    return adapted;
  }

  /**
   * 适配到Claude平台
   */
  static adaptToClaude(messages, options = {}) {
    const { maxMessageLength, includeSystemPrompt } = options;
    const adapted = [];

    // Claude使用严格的角色系统：user, assistant, system
    // 需要将我们的消息类型映射到这些角色
    
    // 添加系统提示（可选）
    if (includeSystemPrompt) {
      adapted.push({
        role: 'system',
        content: '你是一个互动学习助手，负责引导用户通过渐进式学习体验。'
      });
    }

    // 转换消息
    let currentRole = 'assistant';
    messages.forEach(msg => {
      const claudeRole = this.mapRoleToClaude(msg.role);
      
      // 如果角色改变，添加新的消息
      if (claudeRole !== currentRole) {
        currentRole = claudeRole;
      }

      const claudeMessage = {
        role: claudeRole,
        content: this.formatContentForClaude(msg)
      };

      // Claude不支持元数据字段，所以需要将关键信息嵌入内容中
      if (msg.type !== 'text') {
        claudeMessage.content = this.injectMetadataIntoContent(claudeMessage.content, msg);
      }

      adapted.push(claudeMessage);
    });

    return adapted;
  }

  /**
   * 适配到OpenAI平台
   */
  static adaptToOpenAI(messages, options = {}) {
    const { maxMessageLength, includeSystemPrompt } = options;
    const adapted = [];

    // OpenAI使用类似Claude的角色系统
    if (includeSystemPrompt) {
      adapted.push({
        role: 'system',
        content: '你是一个互动学习助手，负责引导用户通过渐进式学习体验。'
      });
    }

    // 转换消息
    messages.forEach(msg => {
      const openaiRole = this.mapRoleToOpenAI(msg.role);
      const openaiMessage = {
        role: openaiRole,
        content: this.formatContentForOpenAI(msg)
      };

      // OpenAI支持在消息中嵌入函数调用，但我们这里只处理基本消息
      if (msg.type === 'quiz_question' || msg.type === 'branch_point') {
        // 对于交互式消息，需要特殊处理
        openaiMessage.content = this.formatInteractiveForOpenAI(msg);
      }

      adapted.push(openaiMessage);
    });

    return adapted;
  }

  /**
   * 适配到通用格式
   */
  static adaptToGeneric(messages, options = {}) {
    const { maxMessageLength } = options;
    
    // 通用格式保持原始结构，但确保标准化
    return messages.map(msg => ({
      role: msg.role,
      type: msg.type,
      content: msg.content,
      metadata: msg.metadata || {},
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * 将角色映射到WorkBuddy格式
   */
  static mapRoleToWorkBuddy(role) {
    const mapping = {
      'assistant': 'assistant',
      'user': 'user',
      'system': 'system'
    };
    return mapping[role] || 'assistant';
  }

  /**
   * 将角色映射到Claude格式
   */
  static mapRoleToClaude(role) {
    const mapping = {
      'assistant': 'assistant',
      'user': 'user',
      'system': 'system'
    };
    return mapping[role] || 'assistant';
  }

  /**
   * 将角色映射到OpenAI格式
   */
  static mapRoleToOpenAI(role) {
    const mapping = {
      'assistant': 'assistant',
      'user': 'user',
      'system': 'system'
    };
    return mapping[role] || 'assistant';
  }

  /**
   * 格式化内容以适应Claude的限制
   */
  static formatContentForClaude(message) {
    let content = message.content;
    
    // Claude对格式化的Markdown支持良好，但需要确保内容简洁
    if (message.type === 'quiz_question') {
      content = `### 知识检查点\n\n${content}`;
      
      if (message.options && message.options.length > 0) {
        content += '\n\n**选项**：\n';
        message.options.forEach(opt => {
          content += `- ${opt.text}\n`;
        });
      }
    }
    
    return this.truncateContent(content, 2000); // Claude有令牌限制
  }

  /**
   * 格式化内容以适应OpenAI的限制
   */
  static formatContentForOpenAI(message) {
    let content = message.content;
    
    // OpenAI也支持Markdown
    if (message.type === 'branch_point') {
      content = `**选择点**：${content}\n\n`;
      
      if (message.options && message.options.length > 0) {
        content += '请选择：\n';
        message.options.forEach((opt, idx) => {
          content += `${idx + 1}. ${opt.text}\n`;
        });
      }
    }
    
    return this.truncateContent(content, 2000);
  }

  /**
   * 将选择题格式化为WorkBuddy格式
   */
  static formatQuizForWorkBuddy(message) {
    let content = `### ${message.content}\n\n`;
    
    if (message.options && message.options.length > 0) {
      content += '**选项**：\n\n';
      message.options.forEach((opt, idx) => {
        const prefix = opt.isCorrect ? '[✓] ' : '[ ] ';
        content += `${idx + 1}. ${prefix}${opt.text}\n`;
      });
    }
    
    // 添加尝试次数信息
    if (message.maxAttempts && message.maxAttempts > 1) {
      content += `\n💡 你有最多 ${message.maxAttempts} 次尝试机会。`;
    }
    
    // 添加提示可用性信息
    if (message.progressiveHints && message.progressiveHints.length > 0) {
      content += `\n💡 如果需要帮助，可以请求提示（共 ${message.progressiveHints.length} 级提示）。`;
    }
    
    return content;
  }

  /**
   * 将分支选择点格式化为WorkBuddy格式
   */
  static formatBranchPointForWorkBuddy(message) {
    let content = `### 决策点\n\n${message.content}\n\n`;
    
    if (message.options && message.options.length > 0) {
      content += '**选择**：\n\n';
      message.options.forEach((opt, idx) => {
        content += `${idx + 1}. ${opt.text}\n`;
      });
    }
    
    return content;
  }

  /**
   * 将练习格式化为WorkBuddy格式
   */
  static formatExerciseForWorkBuddy(message) {
    return `### 实践练习\n\n${message.content}`;
  }

  /**
   * 将交互式消息格式化为OpenAI格式
   */
  static formatInteractiveForOpenAI(message) {
    let content = message.content;
    
    if (message.type === 'quiz_question') {
      content = `**问题**：${content}\n\n`;
      
      if (message.options) {
        content += '请选择正确答案：\n';
        message.options.forEach((opt, idx) => {
          content += `${String.fromCharCode(65 + idx)}. ${opt.text}\n`;
        });
      }
    }
    
    return content;
  }

  /**
   * 从消息中提取交互元素
   */
  static extractInteractiveElements(message) {
    const elements = {};
    
    if (message.type === 'quiz_question') {
      elements.quiz = {
        questionType: message.questionType,
        options: message.options || [],
        correctAnswers: message.correctAnswers,
        maxAttempts: message.maxAttempts,
        progressiveHints: message.progressiveHints || []
      };
    }
    
    if (message.type === 'branch_point') {
      elements.branch = {
        branchId: message.branchId,
        options: message.options || []
      };
    }
    
    return Object.keys(elements).length > 0 ? elements : null;
  }

  /**
   * 将元数据注入到内容中
   */
  static injectMetadataIntoContent(content, message) {
    // 对于不支持元数据的平台，将关键信息嵌入内容
    let enhancedContent = content;
    
    if (message.type && message.type !== 'text') {
      enhancedContent += `\n\n[消息类型：${message.type}]`;
    }
    
    if (message.metadata) {
      // 只注入最重要的元数据
      if (message.metadata.title) {
        enhancedContent += `\n[标题：${message.metadata.title}]`;
      }
    }
    
    return enhancedContent;
  }

  /**
   * 应用消息长度限制
   */
  static applyLengthLimits(messages, maxLength) {
    return messages.map(msg => {
      if (msg.content && msg.content.length > maxLength) {
        return {
          ...msg,
          content: this.truncateContent(msg.content, maxLength)
        };
      }
      return msg;
    });
  }

  /**
   * 截断内容到指定长度
   */
  static truncateContent(content, maxLength) {
    if (content.length <= maxLength) return content;
    
    // 在句子边界处截断
    const truncated = content.substring(0, maxLength - 3);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');
    const lastNewline = truncated.lastIndexOf('\n');
    
    const cutoff = Math.max(lastPeriod, lastQuestion, lastExclamation, lastNewline, maxLength - 50);
    
    if (cutoff > maxLength * 0.7) {
      return truncated.substring(0, cutoff + 1) + '...';
    }
    
    return truncated + '...';
  }

  /**
   * 添加平台元数据
   */
  static addPlatformMetadata(messages, platform) {
    return messages.map(msg => ({
      ...msg,
      _platform: platform,
      _adaptedAt: new Date().toISOString()
    }));
  }

  /**
   * 获取平台支持的功能
   */
  static getPlatformCapabilities(platform) {
    const capabilities = {
      workbuddy: {
        maxMessageLength: 4000,
        supportsMetadata: true,
        supportsInteractiveElements: true,
        supportsMarkdown: true,
        supportsImages: true
      },
      claude: {
        maxMessageLength: 2000,
        supportsMetadata: false,
        supportsInteractiveElements: false,
        supportsMarkdown: true,
        supportsImages: false
      },
      openai: {
        maxMessageLength: 2000,
        supportsMetadata: false,
        supportsInteractiveElements: false, // 除非使用函数调用
        supportsMarkdown: true,
        supportsImages: false // 除非使用视觉API
      },
      generic: {
        maxMessageLength: 4000,
        supportsMetadata: true,
        supportsInteractiveElements: true,
        supportsMarkdown: true,
        supportsImages: true
      }
    };
    
    return capabilities[platform] || capabilities.generic;
  }

  /**
   * 检测当前运行平台
   */
  static detectCurrentPlatform() {
    // 简单检测：通过环境变量或全局对象判断
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.WORKBUDDY_ENV) {
        return 'workbuddy';
      }
    }
    
    // 默认返回当前最可能的平台
    return 'workbuddy';
  }
}

module.exports = PlatformAdapter;