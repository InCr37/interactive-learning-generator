/**
 * JSON结构导出器
 * 
 * 提供结构化数据供其他工具使用，包含完整的学习设计信息。
 * 支持多种数据格式和扩展点。
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class JsonExporter {
  /**
   * 导出为JSON结构
   * @param {Object} interactiveDesign - 互动学习设计
   * @param {string} outputDir - 输出目录
   * @param {Object} templateManager - 模板管理器
   * @returns {Promise<Object>} 导出结果
   */
  static async export(interactiveDesign, outputDir, templateManager) {
    console.log('导出为JSON结构');
    
    // 验证设计
    const errors = this.validateDesign(interactiveDesign);
    if (errors.length > 0) {
      throw new Error(`设计验证失败：${errors.join('；')}`);
    }
    
    // 创建输出目录
    const jsonDir = path.join(outputDir, 'json-export');
    await fs.ensureDir(jsonDir);
    
    // 生成结构化数据
    const jsonStructure = this.createJsonStructure(interactiveDesign);
    
    // 生成文件名
    const exportId = uuidv4().substring(0, 8);
    const filename = `interactive-learning-${exportId}.json`;
    const outputPath = path.join(jsonDir, filename);
    
    // 写入JSON文件
    await fs.writeJson(outputPath, jsonStructure, { spaces: 2 });
    
    // 生成模式文件（可选）
    const schema = this.generateSchema(jsonStructure);
    const schemaPath = path.join(jsonDir, 'learning-schema.json');
    await fs.writeJson(schemaPath, schema, { spaces: 2 });
    
    // 生成简化版本
    const simplified = this.createSimplifiedVersion(jsonStructure);
    const simplifiedPath = path.join(jsonDir, 'simplified-version.json');
    await fs.writeJson(simplifiedPath, simplified, { spaces: 2 });
    
    return {
      mainOutputPath: outputPath,
      additionalFiles: [
        { path: schemaPath, type: 'schema', description: 'JSON模式定义' },
        { path: simplifiedPath, type: 'simplified', description: '简化版本' }
      ],
      format: 'json',
      exportId,
      dataStructure: this.describeDataStructure(jsonStructure)
    };
  }
  
  /**
   * 验证设计
   */
  static validateDesign(interactiveDesign) {
    const errors = [];
    
    if (!interactiveDesign) {
      errors.push('缺少互动学习设计');
      return errors;
    }
    
    if (!interactiveDesign.title || interactiveDesign.title.trim().length === 0) {
      errors.push('缺少学习标题');
    }
    
    if (!interactiveDesign.concepts || interactiveDesign.concepts.length === 0) {
      errors.push('缺少学习概念');
    }
    
    return errors;
  }
  
  /**
   * 创建JSON结构
   */
  static createJsonStructure(interactiveDesign) {
    const { 
      title, 
      targetAudience,
      concepts,
      learningObjectives,
      interactiveModules,
      designPrinciplesApplied,
      narrativeFramework,
      difficulty,
      metadata
    } = interactiveDesign;
    
    // 构建完整结构
    const structure = {
      metadata: {
        id: `learning-design-${uuidv4().substring(0, 8)}`,
        title,
        version: '1.0',
        created: new Date().toISOString(),
        generator: '渐进式互动学习生成器',
        formatVersion: '1.0'
      },
      
      design: {
        targetAudience,
        designPrinciples: designPrinciplesApplied,
        narrativeFramework: {
          ...narrativeFramework,
          // 移除可能循环引用的部分
          characters: narrativeFramework?.characters ? 
            Object.keys(narrativeFramework.characters) : [],
          settings: narrativeFramework?.settings?.map(s => s.name) || []
        },
        difficulty: {
          overall: difficulty,
          assessment: interactiveDesign.difficultyAssessment || {}
        }
      },
      
      content: {
        concepts: concepts.map(concept => ({
          id: concept.id,
          term: concept.term,
          definition: concept.definition || '',
          type: concept.type || 'generic',
          metadata: {
            sourceLine: concept.sourceLine,
            confidence: concept.confidence
          }
        })),
        
        learningObjectives: learningObjectives.map(obj => ({
          id: obj.id,
          text: obj.text,
          bloomLevel: obj.bloomLevel || '理解',
          type: obj.type || 'explicit'
        })),
        
        modules: interactiveModules.map((module, index) => {
          const baseModule = {
            id: module.id || `module_${index + 1}`,
            type: module.type,
            title: module.title,
            order: module.order || index + 1,
            estimatedTime: module.estimatedTime || 5,
            difficulty: module.difficulty || 5,
            designPrinciples: module.designPrinciples || []
          };
          
          // 根据模块类型添加特定数据
          switch (module.type) {
            case 'dialogue':
              return {
                ...baseModule,
                dialogue: {
                  introduction: module.introduction,
                  exploration: module.exploration,
                  branches: module.branches?.map(branch => ({
                    id: branch.id,
                    prompt: branch.prompt,
                    options: branch.options?.map(opt => ({
                      id: opt.id,
                      text: opt.text,
                      isCorrect: opt.isCorrect,
                      feedback: opt.feedback,
                      nextStep: opt.nextStep
                    }))
                  })),
                  conclusion: module.conclusion
                }
              };
              
            case 'quiz':
              return {
                ...baseModule,
                quiz: {
                  questionType: module.questionType,
                  questionStem: module.questionStem,
                  options: module.options?.map(opt => ({
                    id: opt.id,
                    text: opt.text,
                    isCorrect: opt.isCorrect,
                    explanation: opt.explanation || '',
                    misconceptionType: opt.misconceptionType || null
                  })),
                  correctAnswers: module.correctAnswers,
                  feedback: module.feedback,
                  // 新增字段支持新设计原则
                  maxAttempts: module.maxAttempts || null,
                  progressiveHints: module.progressiveHints?.map(hint => ({
                    level: hint.level,
                    trigger: hint.trigger,
                    content: hint.content
                  })) || [],
                  adaptiveMetadata: module.adaptiveMetadata || null,
                  metadata: module.metadata || null,
                  // 难度分级信息
                  difficultyLevel: module.metadata?.difficultyLevel || null,
                  cognitiveLevel: module.metadata?.cognitiveLevel || null,
                  successThreshold: module.metadata?.successThreshold || null
                }
              };
              
            case 'exercise':
              return {
                ...baseModule,
                exercise: {
                  scenario: module.scenario,
                  task: module.task,
                  steps: module.steps?.map(step => ({
                    step: step.step,
                    description: step.description,
                    guidance: step.guidance
                  })),
                  hints: module.hints?.map(hint => ({
                    id: hint.id,
                    text: hint.text,
                    level: hint.level
                  })),
                  feedback: module.feedback
                }
              };
              
            default:
              return {
                ...baseModule,
                content: module.content || ''
              };
          }
        })
      },
      
      progression: {
        moduleOrder: interactiveModules.map(m => m.id),
        conceptProgression: this.createConceptProgression(concepts, interactiveModules),
        learningPath: this.createLearningPath(interactiveModules, narrativeFramework)
      },
      
      analytics: {
        totalModules: interactiveModules.length,
        totalConcepts: concepts.length,
        totalObjectives: learningObjectives.length,
        estimatedLearningTime: metadata?.estimatedLearningTime || 30,
        difficultyDistribution: this.calculateDifficultyDistribution(interactiveModules)
      },
      
      extensions: {
        supportedFormats: ['twine', 'html', 'json', 'scorm'],
        integrationPoints: this.identifyIntegrationPoints(interactiveDesign),
        customizationOptions: this.defineCustomizationOptions()
      }
    };
    
    return structure;
  }
  
  /**
   * 创建概念进展
   */
  static createConceptProgression(concepts, interactiveModules) {
    const progression = {};
    
    concepts.forEach(concept => {
      // 找到概念出现的模块
      const moduleOccurrences = interactiveModules
        .filter(module => 
          module.concepts && 
          module.concepts.includes(concept.term)
        )
        .map(module => module.id);
      
      progression[concept.id] = {
        term: concept.term,
        firstIntroduction: moduleOccurrences[0] || null,
        reinforcementPoints: moduleOccurrences.slice(1),
        totalOccurrences: moduleOccurrences.length
      };
    });
    
    return progression;
  }
  
  /**
   * 创建学习路径
   */
  static createLearningPath(interactiveModules, narrativeFramework) {
    const path = {
      linearPath: interactiveModules.map(module => ({
        moduleId: module.id,
        moduleType: module.type,
        title: module.title,
        estimatedTime: module.estimatedTime
      })),
      
      branchPoints: []
    };
    
    // 识别分支点
    interactiveModules.forEach(module => {
      if (module.type === 'dialogue' && module.branches) {
        module.branches.forEach(branch => {
          if (branch.options && branch.options.length > 0) {
            path.branchPoints.push({
              moduleId: module.id,
              branchId: branch.id,
              prompt: branch.prompt,
              options: branch.options.map(opt => ({
                optionId: opt.id,
                text: opt.text.substring(0, 30) + '...',
                target: opt.nextStep || 'next'
              }))
            });
          }
        });
      }
    });
    
    // 添加叙事框架信息
    if (narrativeFramework) {
      path.narrativeStructure = {
        theme: narrativeFramework.theme,
        acts: narrativeFramework.structure?.threeActStructure || null,
        settings: narrativeFramework.settings?.map(s => s.name) || []
      };
    }
    
    return path;
  }
  
  /**
   * 计算难度分布
   */
  static calculateDifficultyDistribution(interactiveModules) {
    const difficulties = interactiveModules
      .map(m => m.difficulty || 5)
      .filter(d => typeof d === 'number');
    
    if (difficulties.length === 0) {
      return {
        average: 5,
        min: 5,
        max: 5,
        distribution: { '1-3': 0, '4-6': 0, '7-10': 0 }
      };
    }
    
    const average = difficulties.reduce((a, b) => a + b, 0) / difficulties.length;
    const min = Math.min(...difficulties);
    const max = Math.max(...difficulties);
    
    // 计算分布
    const distribution = {
      '1-3': difficulties.filter(d => d >= 1 && d <= 3).length,
      '4-6': difficulties.filter(d => d >= 4 && d <= 6).length,
      '7-10': difficulties.filter(d => d >= 7 && d <= 10).length
    };
    
    return {
      average: Math.round(average * 10) / 10,
      min,
      max,
      distribution
    };
  }
  
  /**
   * 识别集成点
   */
  static identifyIntegrationPoints(interactiveDesign) {
    const points = [];
    
    // 概念集成点
    points.push({
      type: 'concept-mastery',
      description: '概念掌握度跟踪',
      dataPath: '$.content.concepts[*]',
      integrationType: 'learning-analytics'
    });
    
    // 模块完成集成点
    points.push({
      type: 'module-completion',
      description: '模块完成状态跟踪',
      dataPath: '$.content.modules[*].id',
      integrationType: 'progress-tracking'
    });
    
    // 评估集成点
    points.push({
      type: 'assessment-results',
      description: '选择题和练习结果',
      dataPath: '$.content.modules[?(@.type=="quiz" || @.type=="exercise")]',
      integrationType: 'assessment-analytics'
    });
    
    return points;
  }
  
  /**
   * 定义定制选项
   */
  static defineCustomizationOptions() {
    return {
      visual: {
        themes: ['educational-blue', 'professional-gray', 'accessible-high-contrast'],
        fontSizes: ['small', 'medium', 'large'],
        colorSchemes: ['light', 'dark', 'sepia']
      },
      interaction: {
        navigation: ['linear', 'non-linear', 'adaptive'],
        feedbackLevel: ['minimal', 'standard', 'detailed'],
        hintAvailability: ['on-demand', 'progressive', 'always']
      },
      content: {
        difficultyAdjustment: ['fixed', 'adaptive', 'learner-selected'],
        language: ['zh-CN', 'en-US', 'auto'],
        paceControl: ['system-paced', 'self-paced', 'mixed']
      }
    };
  }
  
  /**
   * 生成模式
   */
  static generateSchema(jsonStructure) {
    // 简化模式生成
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: '互动学习设计模式',
      description: '渐进式互动学习生成器输出的JSON数据模式',
      type: 'object',
      properties: {
        metadata: { type: 'object' },
        design: { type: 'object' },
        content: { type: 'object' },
        progression: { type: 'object' },
        analytics: { type: 'object' },
        extensions: { type: 'object' }
      },
      required: ['metadata', 'content'],
      examples: [jsonStructure]
    };
  }
  
  /**
   * 创建简化版本
   */
  static createSimplifiedVersion(jsonStructure) {
    return {
      title: jsonStructure.metadata.title,
      summary: {
        modules: jsonStructure.analytics.totalModules,
        concepts: jsonStructure.analytics.totalConcepts,
        estimatedTime: jsonStructure.analytics.estimatedLearningTime,
        averageDifficulty: jsonStructure.analytics.difficultyDistribution.average
      },
      concepts: jsonStructure.content.concepts.slice(0, 5).map(c => c.term),
      modules: jsonStructure.content.modules.slice(0, 3).map(m => ({
        type: m.type,
        title: m.title,
        estimatedTime: m.estimatedTime
      })),
      exportInfo: {
        exportedAt: jsonStructure.metadata.created,
        formatVersion: jsonStructure.metadata.formatVersion
      }
    };
  }
  
  /**
   * 描述数据结构
   */
  static describeDataStructure(jsonStructure) {
    return {
      totalSize: JSON.stringify(jsonStructure).length,
      elementCounts: {
        concepts: jsonStructure.content.concepts.length,
        objectives: jsonStructure.content.learningObjectives.length,
        modules: jsonStructure.content.modules.length,
        branchPoints: (jsonStructure.progression.learningPath?.branchPoints || []).length
      },
      dataTypes: {
        concepts: '学习概念和定义',
        modules: '互动学习模块',
        progression: '学习路径和进展',
        analytics: '统计和分析数据'
      }
    };
  }
}

module.exports = JsonExporter;