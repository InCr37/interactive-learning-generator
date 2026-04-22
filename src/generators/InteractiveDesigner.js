/**
 * 互动设计器 - 协调不同生成模块
 * 
 * 基于分析结果构建分支叙事、选择题和互动练习，确保渐进式学习曲线。
 * 包括：分支对话生成、选择题生成、互动练习生成、叙事编织。
 */

const fs = require('fs-extra');
const path = require('path');
const BranchingDialogueGenerator = require('./BranchingDialogueGenerator');
const QuizGenerator = require('./QuizGenerator');
const InteractiveExerciseGenerator = require('./InteractiveExerciseGenerator');
const NarrativeWeaver = require('./NarrativeWeaver');
const DiagramGenerator = require('../visual/DiagramGenerator');
const TeachingFlowGenerator = require('./TeachingFlowGenerator');
const DesignPrinciples = require('../utils/designPrinciples');

class InteractiveDesigner {
  /**
   * 设计互动学习体验
   * @param {Object} analysisResult - 内容分析结果
   * @param {Object} options - 设计选项
   * @returns {Promise<Object>} 互动学习设计
   */
  static async design(analysisResult, options = {}) {
    console.log('开始设计互动学习体验');

    const { concepts, learningObjectives, difficultyAssessment, designPrinciples } = analysisResult;
    const {
      applyPrinciples = [],
      generateVisuals = true,
      neutralInterface = true,
      tempDir,
      context
    } = options;

    // Check if content is for beginners or programming-related
    const isBeginner = difficultyAssessment.overallDifficulty < 5;
    const isProgramming = DesignPrinciples.isProgrammingRelated(concepts);

    // 1. 编织叙事框架
    const narrativeFramework = await NarrativeWeaver.weave(
      concepts,
      learningObjectives,
      designPrinciples,
      { neutral: neutralInterface }
    );

    // 2. For beginner/programming content, generate teaching-first flow FIRST
    let teachingFlows = [];
    let taughtConcepts = [];
    let recentExamples = [];

    if (isBeginner || isProgramming) {
      console.log('检测到初学者或编程内容，启用先讲后练模式');
      teachingFlows = await TeachingFlowGenerator.generate(
        concepts,
        narrativeFramework,
        difficultyAssessment,
        { neutral: neutralInterface }
      );

      // Extract taught concepts and examples from teaching flows for quiz deduplication
      taughtConcepts = teachingFlows
        .filter(f => f.type === 'teaching')
        .map(f => ({
          concept: f.concept,
          method: f.subtype,
          keyParams: null
        }));

      recentExamples = teachingFlows
        .filter(f => f.type === 'teaching' && f.content)
        .map(f => ({
          concept: f.concept,
          method: f.subtype,
          text: f.content.explanation || f.content.example || '',
          keyParams: null
        }));
    }

    // 3. 生成分支对话
    const branchingDialogues = await BranchingDialogueGenerator.generate(
      concepts,
      narrativeFramework,
      difficultyAssessment,
      { neutral: neutralInterface }
    );

    // 4. 生成选择题（传入教过的概念和例子用于去重）
    const quizzes = await QuizGenerator.generate(
      concepts,
      learningObjectives,
      difficultyAssessment,
      {
        applyPrinciples: applyPrinciples || [],
        taughtConcepts,
        recentExamples
      }
    );

    // 5. 生成互动练习
    const exercises = await InteractiveExerciseGenerator.generate(
      concepts,
      learningObjectives,
      difficultyAssessment
    );

    // 6. 对于初学者或综合练习，生成螺旋式练习
    let spiralPracticeFlow = null;
    if ((isBeginner || isProgramming) && teachingFlows.length > 0 && concepts.length >= 2) {
      console.log('启用螺旋式练习模式：渐进整合先前所学概念');
      const TeachingFlowGen = require('./TeachingFlowGenerator');
      spiralPracticeFlow = TeachingFlowGen.integrateSpiralPractice(
        teachingFlows,
        concepts,
        { integrationPoint: 2, includeFinalChallenge: true }
      );
    }

    // 7. 生成可视化内容（如果启用）
    let generatedVisuals = null;
    if (generateVisuals && context && tempDir) {
      try {
        // 创建visuals子目录
        const visualsDir = path.join(tempDir, 'visuals');
        await fs.ensureDir(visualsDir);
        
        generatedVisuals = await DiagramGenerator.generateAllVisuals(
          concepts,
          { learningObjectives, difficultyAssessment, designPrinciples },
          context,
          visualsDir
        );
        
        console.log(`已生成可视化内容：${generatedVisuals.conceptDiagrams.length}个概念图`);
      } catch (visualError) {
        console.error(`可视化内容生成失败：${visualError.message}`);
      }
    }
    
    // 6. 整合为互动模块
    const interactiveModules = this.integrateModules(
      branchingDialogues,
      quizzes,
      exercises,
      narrativeFramework,
      teachingFlows
    );
    
    // 7. 应用教学设计原则
    const principlesApplied = this.applyDesignPrinciplesToModules(
      interactiveModules,
      applyPrinciples,
      designPrinciples
    );
    
    // 构建完整设计
    const interactiveDesign = {
      title: narrativeFramework.title || '互动学习体验',
      targetAudience: analysisResult.metadata.targetAudience || 'student',
      inputFormats: ['text'], // 实际应从processedContent获取
      concepts,
      learningObjectives,
      difficulty: difficultyAssessment.overallDifficulty,
      interactiveModules,
      designPrinciplesApplied: principlesApplied,
      narrativeFramework: {
        ...narrativeFramework,
        neutralInterface
      },
      metadata: {
        designedAt: new Date().toISOString(),
        moduleCount: interactiveModules.length,
        estimatedLearningTime: this.calculateEstimatedTime(interactiveModules, difficultyAssessment),
        requiresVisuals: generateVisuals,
        visualsGenerated: !!generatedVisuals,
        visualsCount: generatedVisuals ?
          generatedVisuals.conceptDiagrams.length +
          generatedVisuals.flowcharts.length +
          generatedVisuals.illustrations.length : 0,
        hasSpiralPractice: !!spiralPracticeFlow,
        totalDuration: spiralPracticeFlow?.totalDuration || null
      },
      generatedVisuals, // 添加生成的可视化内容引用
      spiralPracticeFlow // 螺旋式练习流（如果启用）
    };
    
    console.log(`设计完成：创建 ${interactiveModules.length} 个互动模块`);
    return interactiveDesign;
  }
  
  /**
   * 整合不同模块
   * For beginners, teaching flows come FIRST before any quizzes or exercises
   */
  static integrateModules(dialogues, quizzes, exercises, narrativeFramework, teachingFlows = []) {
    const modules = [];
    let moduleId = 1;

    // For beginners: teaching flow goes FIRST
    if (teachingFlows.length > 0) {
      console.log(`整合${teachingFlows.length}个教学模块（先讲后练模式）`);
      for (const flow of teachingFlows) {
        modules.push({
          ...flow,
          id: `module_${moduleId++}`,
          order: modules.length + 1
        });
      }
      // Add a summary/review module after teaching flows (no CLI-style prompts)
      modules.push({
        id: `module_${moduleId++}`,
        order: modules.length + 1,
        type: 'review',
        title: 'Review and Practice',
        content: 'Now that we have learned the basics, let\'s practice with some exercises!',
        designPrinciples: ['seamless-flow'],
        transitionHint: 'Ready to test your knowledge?',
        noCliPrompts: true
      });
      return modules;
    }

    // 按叙事顺序整合模块
    const narrativeSequence = narrativeFramework.sequence || [];
    
    // 如果没有预设序列，创建默认序列
    if (narrativeSequence.length === 0) {
      // 对话 -> 练习 -> 测验 的循环模式
      for (let i = 0; i < Math.max(dialogues.length, quizzes.length, exercises.length); i++) {
        if (i < dialogues.length) {
          modules.push({
            ...dialogues[i],
            id: `module_${moduleId++}`,
            order: modules.length + 1,
            type: 'dialogue'
          });
        }
        
        if (i < exercises.length) {
          modules.push({
            ...exercises[i],
            id: `module_${moduleId++}`,
            order: modules.length + 1,
            type: 'exercise'
          });
        }
        
        if (i < quizzes.length && i % 2 === 0) { // 每两个循环加一个测验
          modules.push({
            ...quizzes[i],
            id: `module_${moduleId++}`,
            order: modules.length + 1,
            type: 'quiz'
          });
        }
      }
    }
    
    // 确保至少有一个模块
    if (modules.length === 0) {
      modules.push({
        id: 'module_1',
        type: 'dialogue',
        title: '欢迎学习',
        content: '欢迎开始学习之旅！',
        order: 1,
        estimatedTime: 5
      });
    }
    
    return modules;
  }
  
  /**
   * 应用教学设计原则到模块
   */
  static applyDesignPrinciplesToModules(modules, applyPrinciples, designPrinciples) {
    const appliedPrinciples = new Set();
    
    // 检查每个模块应用了哪些原则
    modules.forEach(module => {
      if (module.designPrinciples) {
        module.designPrinciples.forEach(principle => appliedPrinciples.add(principle));
      }
    });
    
    // 添加从设计原则中继承的原则
    if (designPrinciples && designPrinciples.appliedPrinciples) {
      designPrinciples.appliedPrinciples.forEach(principle => appliedPrinciples.add(principle));
    }
    
    // 添加显式要求的原則
    applyPrinciples.forEach(principle => appliedPrinciples.add(principle));
    
    return Array.from(appliedPrinciples);
  }
  
  /**
   * 计算估计学习时间
   */
  static calculateEstimatedTime(modules, difficultyAssessment) {
    const baseTimePerModule = 3; // 分钟
    const difficultyMultiplier = 1 + (difficultyAssessment.overallDifficulty - 5) / 10;
    
    const moduleTime = modules.reduce((total, module) => {
      return total + (module.estimatedTime || baseTimePerModule);
    }, 0);
    
    return Math.round(moduleTime * difficultyMultiplier);
  }
}

module.exports = InteractiveDesigner;