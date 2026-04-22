/**
 * 内容分析器 - 协调不同分析模块
 * 
 * 使用NLP技术识别关键实体、关系和学习路径，应用教学设计原则矩阵。
 * 包括：概念提取、学习目标检测、难度评估、教学设计原则应用。
 */

const ConceptExtractor = require('./ConceptExtractor');
const LearningObjectiveDetector = require('./LearningObjectiveDetector');
const DifficultyAssessor = require('./DifficultyAssessor');
const DesignPrincipleApplier = require('./DesignPrincipleApplier');

class ContentAnalyzer {
  /**
   * 分析学习内容
   * @param {Object} processedContent - 处理后的内容结构
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 分析结果
   */
  static async analyze(processedContent, options = {}) {
    console.log('开始分析学习内容');
    
    // 1. 提取关键概念
    const concepts = await ConceptExtractor.extract(processedContent);
    
    // 2. 检测学习目标
    const learningObjectives = await LearningObjectiveDetector.detect(processedContent);
    
    // 3. 评估难度
    const difficultyAssessment = await DifficultyAssessor.assess(concepts, processedContent);
    
    // 4. 应用教学设计原则
    const designPrinciples = await DesignPrincipleApplier.apply(
      concepts, 
      learningObjectives, 
      difficultyAssessment,
      options
    );
    
    // 构建完整分析结果
    const analysisResult = {
      concepts,
      learningObjectives,
      difficultyAssessment,
      designPrinciples,
      metadata: {
        analyzedAt: new Date().toISOString(),
        targetAudience: options.targetAudience || 'student',
        language: options.language || 'zh-CN'
      }
    };
    
    console.log(`分析完成：提取 ${concepts.length} 个概念，${learningObjectives.length} 个学习目标`);
    return analysisResult;
  }
}

module.exports = ContentAnalyzer;