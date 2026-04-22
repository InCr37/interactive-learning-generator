/**
 * 生成器测试 - 验证互动内容的逻辑正确性
 * 
 * 测试覆盖：
 * 1. 分支对话生成器
 * 2. 选择题生成器（增强版）
 * 3. 互动练习生成器
 * 4. 叙事编织器
 */

const assert = require('assert');

// 模拟概念数据
const mockConcepts = [
  { id: 'concept_1', name: '布尔代数', description: '基于逻辑运算符的代数系统', difficulty: 5 },
  { id: 'concept_2', name: '逻辑门', description: '实现基本逻辑运算的电子元件', difficulty: 4 },
  { id: 'concept_3', name: '真值表', description: '展示逻辑函数所有可能输入输出组合的表格', difficulty: 3 }
];

// 模拟学习目标
const mockLearningObjectives = [
  { id: 'obj_1', text: '理解布尔代数的基本运算符', targetConcept: 'concept_1' },
  { id: 'obj_2', text: '掌握AND、OR、NOT逻辑门的功能', targetConcept: 'concept_2' },
  { id: 'obj_3', text: '能够构建和分析简单真值表', targetConcept: 'concept_3' }
];

// 模拟难度评估
const mockDifficultyAssessment = {
  overallDifficulty: 6,
  conceptDifficulties: {
    'concept_1': 5,
    'concept_2': 4,
    'concept_3': 3
  },
  audienceSuitability: 'student'
};

// 模拟用户表现
const mockUserPerformance = {
  correctRate: 0.7,
  avgAttempts: 1.8,
  avgTime: 45,
  commonErrors: ['混淆运算符优先级', '忽略边界情况']
};

// 测试选择题生成器
async function testQuizGenerator() {
  console.log('测试选择题生成器...');
  
  try {
    // 动态导入QuizGenerator（避免硬依赖）
    const QuizGenerator = require('../src/generators/QuizGenerator');
    
    // 测试1：基本生成
    const quizzes = await QuizGenerator.generate(
      mockConcepts,
      mockLearningObjectives,
      mockDifficultyAssessment,
      { maxQuizzes: 3 }
    );
    
    assert(Array.isArray(quizzes), '应返回数组');
    assert(quizzes.length > 0, '应至少生成一个题目');
    
    // 测试2：新设计原则应用
    const enhancedQuizzes = await QuizGenerator.generate(
      mockConcepts,
      mockLearningObjectives,
      mockDifficultyAssessment,
      {
        applyPrinciples: ['high-frequency-questioning', 'problem-solving-opportunities'],
        userPerformance: mockUserPerformance,
        generateQuickQuizzes: true
      }
    );
    
    // 检查是否包含新特性
    const firstQuiz = enhancedQuizzes[0];
    assert(firstQuiz, '应至少有一个题目');
    
    // 检查是否有尝试次数限制
    if (firstQuiz.maxAttempts) {
      assert(firstQuiz.maxAttempts > 0, '尝试次数应为正数');
    }
    
    // 检查是否有渐进提示
    if (firstQuiz.progressiveHints) {
      assert(Array.isArray(firstQuiz.progressiveHints), '渐进提示应为数组');
    }
    
    console.log('✓ 选择题生成器测试通过');
    return true;
  } catch (error) {
    console.error('✗ 选择题生成器测试失败:', error.message);
    return false;
  }
}

// 测试分支对话生成器
async function testBranchingDialogueGenerator() {
  console.log('测试分支对话生成器...');
  
  try {
    // 动态导入BranchingDialogueGenerator
    const BranchingDialogueGenerator = require('../src/generators/BranchingDialogueGenerator');
    
    // 创建测试情境
    const scenario = {
      title: '安全系统设计',
      description: '为大楼设计安全访问控制系统',
      concepts: mockConcepts,
      learningObjectives: mockLearningObjectives
    };
    
    // 生成分支对话
    const dialogue = await BranchingDialogueGenerator.generate(
      scenario,
      mockDifficultyAssessment,
      { maxBranches: 3 }
    );
    
    assert(dialogue, '应返回对话对象');
    assert(dialogue.introduction, '应包含介绍部分');
    assert(dialogue.branches, '应包含分支点');
    assert(Array.isArray(dialogue.branches), '分支点应为数组');
    
    if (dialogue.branches.length > 0) {
      const branch = dialogue.branches[0];
      assert(branch.prompt, '分支点应包含提示');
      assert(branch.options, '分支点应包含选项');
    }
    
    console.log('✓ 分支对话生成器测试通过');
    return true;
  } catch (error) {
    console.error('✗ 分支对话生成器测试失败:', error.message);
    return false;
  }
}

// 测试互动练习生成器
async function testInteractiveExerciseGenerator() {
  console.log('测试互动练习生成器...');
  
  try {
    // 动态导入InteractiveExerciseGenerator
    const InteractiveExerciseGenerator = require('../src/generators/InteractiveExerciseGenerator');
    
    // 生成练习
    const exercise = await InteractiveExerciseGenerator.generate(
      mockConcepts,
      mockLearningObjectives,
      mockDifficultyAssessment,
      { type: 'practical', estimatedTime: 10 }
    );
    
    assert(exercise, '应返回练习对象');
    assert(exercise.scenario, '应包含场景描述');
    assert(exercise.task, '应包含任务说明');
    
    if (exercise.steps) {
      assert(Array.isArray(exercise.steps), '步骤应为数组');
    }
    
    console.log('✓ 互动练习生成器测试通过');
    return true;
  } catch (error) {
    console.error('✗ 互动练习生成器测试失败:', error.message);
    return false;
  }
}

// 测试叙事编织器
async function testNarrativeWeaver() {
  console.log('测试叙事编织器...');
  
  try {
    // 动态导入NarrativeWeaver
    const NarrativeWeaver = require('../src/generators/NarrativeWeaver');
    
    // 生成叙事
    const narrative = await NarrativeWeaver.weave(
      mockConcepts,
      mockLearningObjectives,
      { theme: 'engineering', audience: 'student' }
    );
    
    assert(narrative, '应返回叙事对象');
    assert(narrative.storyline, '应包含故事线');
    assert(narrative.modules, '应包含学习模块');
    
    console.log('✓ 叙事编织器测试通过');
    return true;
  } catch (error) {
    console.error('✗ 叙事编织器测试失败:', error.message);
    return false;
  }
}

// 测试设计原则应用
async function testDesignPrincipleApplication() {
  console.log('测试设计原则应用...');
  
  try {
    // 测试新设计原则
    const DesignPrinciples = require('../utils/designPrinciples');
    
    // 测试高频提问
    const hfResult = DesignPrinciples.applyHighFrequencyQuestioning(mockConcepts, mockDifficultyAssessment);
    assert(hfResult.principle === 'high-frequency-questioning', '应应用高频提问原则');
    assert(hfResult.questionDistribution, '应包含问题分布');
    
    // 测试解题机会
    const psoResult = DesignPrinciples.applyProblemSolvingOpportunities(mockConcepts, mockDifficultyAssessment);
    assert(psoResult.principle === 'problem-solving-opportunities', '应应用解题机会原则');
    assert(psoResult.maxAttempts > 0, '应设置尝试次数');
    
    // 测试难度分级
    const dsResult = DesignPrinciples.applyDifficultyScaffolding(mockConcepts, mockDifficultyAssessment);
    assert(dsResult.principle === 'difficulty-scaffolding', '应应用难度分级原则');
    assert(dsResult.levels, '应包含难度级别');
    
    // 测试智能调整
    const aaResult = DesignPrinciples.applyAdaptiveAdjustment(mockConcepts, mockDifficultyAssessment, mockUserPerformance);
    assert(aaResult.principle === 'adaptive-adjustment', '应应用智能调整原则');
    assert(aaResult.adjustmentStrategy, '应包含调整策略');
    
    console.log('✓ 设计原则应用测试通过');
    return true;
  } catch (error) {
    console.error('✗ 设计原则应用测试失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runAllTests() {
  console.log('开始生成器测试...\n');
  
  const tests = [
    testQuizGenerator,
    testBranchingDialogueGenerator,
    testInteractiveExerciseGenerator,
    testNarrativeWeaver,
    testDesignPrincipleApplication
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
      else failed++;
    } catch (error) {
      console.error(`测试运行出错: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n测试完成: ${passed} 通过, ${failed} 失败`);
  return failed === 0;
}

// 如果直接运行此文件
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('测试运行出错:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testQuizGenerator,
  testBranchingDialogueGenerator,
  testInteractiveExerciseGenerator,
  testNarrativeWeaver,
  testDesignPrincipleApplication
};