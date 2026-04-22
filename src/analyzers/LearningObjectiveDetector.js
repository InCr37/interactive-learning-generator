/**
 * 学习目标检测器
 * 
 * 识别学习材料中的教学目标，包括知识、技能、态度等维度。
 * 检测学习目标和预期掌握程度。
 */

class LearningObjectiveDetector {
  /**
   * 从处理后的内容中检测学习目标
   * @param {Object} processedContent - 处理后的内容结构
   * @returns {Promise<Array>} 学习目标数组
   */
  static async detect(processedContent) {
    console.log('检测学习目标');
    
    const text = processedContent.cleanedText || processedContent.extractedText || '';
    
    // 检测学习目标（基于关键词模式）
    const objectives = this.detectObjectivesFromText(text);
    
    return objectives;
  }
  
  /**
   * 从文本中检测学习目标
   */
  static detectObjectivesFromText(text) {
    const objectives = [];
    const lines = text.split('\n');
    
    // 学习目标关键词模式
    const objectivePatterns = [
      { pattern: /学习目标[：:]\s*(.+)/i, type: 'explicit' },
      { pattern: /教学目标[：:]\s*(.+)/i, type: 'explicit' },
      { pattern: /掌握[：:]\s*(.+)/i, type: 'mastery' },
      { pattern: /理解[：:]\s*(.+)/i, type: 'understanding' },
      { pattern: /能够[：:]\s*(.+)/i, type: 'ability' },
      { pattern: /学会[：:]\s*(.+)/i, type: 'skill' },
      { pattern: /了解[：:]\s*(.+)/i, type: 'awareness' }
    ];
    
    lines.forEach((line, index) => {
      objectivePatterns.forEach(({ pattern, type }) => {
        const match = line.match(pattern);
        if (match) {
          const objectiveText = match[1].trim();
          
          // 分割多个目标（分号、句号、数字列表）
          const splitObjectives = this.splitObjectiveText(objectiveText);
          
          splitObjectives.forEach((objText, i) => {
            if (objText.trim().length > 3) {
              objectives.push({
                id: `objective_${objectives.length + 1}`,
                text: objText.trim(),
                type: type,
                bloomLevel: this.estimateBloomLevel(objText.trim(), type),
                sourceLine: index,
                confidence: 0.8
              });
            }
          });
        }
      });
    });
    
    // 如果没有检测到明确目标，尝试从内容推断
    if (objectives.length === 0 && text.length > 0) {
      objectives.push({
        id: 'objective_1',
        text: '理解学习材料中的核心概念和原理',
        type: 'inferred',
        bloomLevel: '理解',
        confidence: 0.5
      });
      
      objectives.push({
        id: 'objective_2',
        text: '能够应用所学知识解决相关问题',
        type: 'inferred',
        bloomLevel: '应用',
        confidence: 0.5
      });
    }
    
    return objectives;
  }
  
  /**
   * 分割目标文本
   */
  static splitObjectiveText(text) {
    // 尝试多种分割符
    const separators = [/[；;]/, /[。.]\s*(?=[一二三四五六七八九十\d])/, /\n/];
    
    for (const separator of separators) {
      if (separator.test(text)) {
        return text.split(separator).filter(s => s.trim().length > 0);
      }
    }
    
    // 如果没有明显分隔符，返回原文本
    return [text];
  }
  
  /**
   * 估计布鲁姆分类法层级
   */
  static estimateBloomLevel(text, type) {
    const lowerText = text.toLowerCase();
    
    // 关键词映射到布鲁姆层级
    const bloomKeywords = {
      '记忆': ['记忆', '背诵', '记住', '识别', '列出', '定义'],
      '理解': ['理解', '解释', '说明', '概括', '比较', '分类'],
      '应用': ['应用', '使用', '执行', '实施', '计算', '解决'],
      '分析': ['分析', '区分', '组织', '归因', '解构', '比较'],
      '评价': ['评价', '判断', '批判', '辩护', '评估', '证明'],
      '创造': ['创造', '设计', '构建', '计划', '生产', '发明']
    };
    
    for (const [level, keywords] of Object.entries(bloomKeywords)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return level;
        }
      }
    }
    
    // 根据类型推断
    const typeToBloom = {
      'explicit': '理解',
      'mastery': '应用',
      'understanding': '理解',
      'ability': '应用',
      'skill': '应用',
      'awareness': '记忆'
    };
    
    return typeToBloom[type] || '理解';
  }
}

module.exports = LearningObjectiveDetector;