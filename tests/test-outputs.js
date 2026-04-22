/**
 * 输出测试 - 验证JSON格式兼容性和AI对话适配器
 * 
 * 测试覆盖：
 * 1. JSON结构化数据导出器
 * 2. AI对话驱动器
 * 3. 平台适配器
 */

const assert = require('assert');

// 模拟互动学习设计
const mockInteractiveDesign = {
  version: '1.2.0',
  language: 'zh-CN',
  title: '布尔代数基础',
  description: '通过安全系统设计场景学习布尔代数',
  metadata: {
    sourceMaterial: 'ELEC1100讲义',
    generatedAt: '2026-04-18T14:44:00Z',
    aiConversationReady: true
  },
  design: {
    designPrinciples: [
      'progressive-disclosure',
      'contextual-narrative',
      'constructive-failure-feedback',
      'high-frequency-questioning',
      'problem-solving-opportunities',
      'difficulty-scaffolding',
      'adaptive-adjustment'
    ],
    difficulty: {
      overall: 6,
      levels: ['basic', 'applied', 'comprehensive']
    }
  },
  content: {
    concepts: [
      { id: 'concept_1', name: '布尔代数', description: '基于逻辑运算符的代数系统' },
      { id: 'concept_2', name: '逻辑门', description: '实现基本逻辑运算的电子元件' }
    ],
    modules: [
      {
        id: 'module_1',
        type: 'dialogue',
        title: '安全系统设计场景',
        learningObjective: '理解布尔代数在现实场景中的应用',
        content: '你是一名安全系统工程师，需要为大楼设计访问控制系统...',
        dialogue: {
          introduction: '欢迎来到安全系统设计项目。',
          exploration: '我们需要设计一个系统，只有授权人员才能进入敏感区域。',
          branches: [
            {
              id: 'branch_1',
              prompt: '你会选择哪种逻辑门来实现"只有刷卡且输入正确密码才能进入"？',
              options: [
                { id: 'opt_a', text: 'AND门', isCorrect: true, feedback: '正确！AND门需要两个输入都为真时才输出真。' },
                { id: 'opt_b', text: 'OR门', isCorrect: false, feedback: 'OR门在任一输入为真时就输出真，不符合"且"的要求。' },
                { id: 'opt_c', text: 'NOT门', isCorrect: false, feedback: 'NOT门是取反操作，不符合此场景。' }
              ]
            }
          ],
          conclusion: '很好！你已掌握AND门在安全系统中的应用。'
        },
        difficulty: 5,
        estimatedTime: 8
      },
      {
        id: 'module_2',
        type: 'quiz',
        title: '知识检查点',
        learningObjective: '掌握逻辑门真值表',
        content: '测试你对逻辑门功能的理解',
        quiz: {
          questionStem: '对于AND门，当输入A=1, B=0时，输出是什么？',
          questionType: 'single_choice',
          options: [
            { id: 'opt_1', text: '0', isCorrect: true },
            { id: 'opt_2', text: '1', isCorrect: false },
            { id: 'opt_3', text: '不确定', isCorrect: false }
          ],
          correctAnswers: ['opt_1'],
          feedback: {
            correct: '正确！AND门需要所有输入都为1时才输出1。',
            incorrect: '再想想，AND门需要所有输入都为1时才输出1。'
          },
          // 新设计原则字段
          maxAttempts: 3,
          progressiveHints: [
            { level: 1, text: '回想AND门的定义：只有所有输入都为真时输出才为真。' },
            { level: 2, text: '真值表：A=1, B=0 → 输出=0' },
            { level: 3, text: 'AND门相当于逻辑"与"操作，需要所有条件同时满足。' }
          ],
          adaptiveMetadata: {
            difficultyLevel: 'basic',
            cognitiveLevel: 'remember',
            successThreshold: 0.7
          }
        },
        difficulty: 4,
        estimatedTime: 5
      }
    ]
  },
  progression: {
    conceptProgression: {
      'concept_1': ['module_1', 'module_2'],
      'concept_2': ['module_1']
    }
  },
  analytics: {
    estimatedLearningTime: 13,
    conceptCoverage: 2,
    interactiveElements: 2
  }
};

// 测试JSON导出器
async function testJsonExporter() {
  console.log('测试JSON导出器...');
  
  try {
    // 动态导入JsonExporter
    const JsonExporter = require('../src/outputs/JsonExporter');
    
    // 导出JSON
    const jsonData = await JsonExporter.export(mockInteractiveDesign, {
      format: 'json',
      includeMetadata: true,
      prettyPrint: true
    });
    
    assert(jsonData, '应返回JSON数据');
    assert(typeof jsonData === 'object', 'JSON数据应为对象');
    
    // 检查基本结构
    assert(jsonData.version, '应包含版本号');
    assert(jsonData.title, '应包含标题');
    assert(jsonData.content, '应包含内容');
    assert(jsonData.content.modules, '应包含模块');
    
    // 检查新设计原则字段
    const quizModule = jsonData.content.modules.find(m => m.type === 'quiz');
    if (quizModule && quizModule.quiz) {
      // 检查新字段是否存在
      if (quizModule.quiz.maxAttempts !== undefined) {
        assert(quizModule.quiz.maxAttempts > 0, '尝试次数应为正数');
      }
      if (quizModule.quiz.progressiveHints) {
        assert(Array.isArray(quizModule.quiz.progressiveHints), '渐进提示应为数组');
      }
      if (quizModule.quiz.adaptiveMetadata) {
        assert(quizModule.quiz.adaptiveMetadata.difficultyLevel, '应包含难度级别');
      }
    }
    
    // 验证JSON可序列化
    const jsonString = JSON.stringify(jsonData);
    assert(jsonString.length > 0, '应能序列化为字符串');
    
    console.log('✓ JSON导出器测试通过');
    return true;
  } catch (error) {
    console.error('✗ JSON导出器测试失败:', error.message);
    return false;
  }
}

// 测试AI对话驱动器
async function testConversationDriver() {
  console.log('测试AI对话驱动器...');
  
  try {
    // 动态导入ConversationDriver
    const ConversationDriver = require('../src/ai_adapter/ConversationDriver');
    
    // 转换为对话消息
    const messages = await ConversationDriver.convertToConversation(mockInteractiveDesign, {
      includeMetadata: true,
      includeHints: true,
      adaptiveMode: true,
      maxMessages: 20
    });
    
    assert(Array.isArray(messages), '应返回消息数组');
    assert(messages.length > 0, '应至少有一条消息');
    
    // 检查消息结构
    const firstMessage = messages[0];
    assert(firstMessage.role, '消息应包含角色');
    assert(firstMessage.content, '消息应包含内容');
    assert(firstMessage.type, '消息应包含类型');
    
    // 检查是否包含欢迎消息
    const welcomeMsg = messages.find(m => m.type === 'welcome');
    assert(welcomeMsg, '应包含欢迎消息');
    
    // 检查是否包含选择题消息
    const quizMsg = messages.find(m => m.type === 'quiz_question');
    if (quizMsg) {
      assert(quizMsg.options || quizMsg.quizId, '选择题消息应包含选项或ID');
    }
    
    console.log('✓ AI对话驱动器测试通过');
    return true;
  } catch (error) {
    console.error('✗ AI对话驱动器测试失败:', error.message);
    return false;
  }
}

// 测试平台适配器
async function testPlatformAdapter() {
  console.log('测试平台适配器...');
  
  try {
    // 动态导入PlatformAdapter
    const PlatformAdapter = require('../src/ai_adapter/PlatformAdapter');
    
    // 先获取对话消息
    const ConversationDriver = require('../src/ai_adapter/ConversationDriver');
    const messages = await ConversationDriver.convertToConversation(mockInteractiveDesign, {
      maxMessages: 5
    });
    
    // 测试适配到WorkBuddy
    const workbuddyMessages = await PlatformAdapter.adapt(messages, {
      platform: 'workbuddy',
      maxMessageLength: 4000
    });
    
    assert(Array.isArray(workbuddyMessages), '应返回消息数组');
    assert(workbuddyMessages.length > 0, '应至少有一条消息');
    
    // 检查WorkBuddy特定字段
    const firstMsg = workbuddyMessages[0];
    assert(firstMsg._platform === 'workbuddy', '应标记为WorkBuddy平台');
    
    // 测试适配到通用格式
    const genericMessages = await PlatformAdapter.adapt(messages, {
      platform: 'generic'
    });
    
    assert(genericMessages.length === messages.length, '通用格式应保持消息数量');
    
    console.log('✓ 平台适配器测试通过');
    return true;
  } catch (error) {
    console.error('✗ 平台适配器测试失败:', error.message);
    return false;
  }
}

// 测试JSON格式兼容性
async function testJsonCompatibility() {
  console.log('测试JSON格式兼容性...');
  
  try {
    // 验证JSON结构符合预期接口
    const jsonData = mockInteractiveDesign;
    
    // 检查必需字段
    const requiredFields = ['version', 'title', 'content', 'design'];
    for (const field of requiredFields) {
      assert(jsonData[field] !== undefined, `应包含必需字段: ${field}`);
    }
    
    // 检查内容结构
    assert(Array.isArray(jsonData.content.modules), 'content.modules应为数组');
    
    // 检查设计原则
    if (jsonData.design.designPrinciples) {
      assert(Array.isArray(jsonData.design.designPrinciples), 'designPrinciples应为数组');
      
      // 检查是否包含新原则
      const newPrinciples = [
        'high-frequency-questioning',
        'problem-solving-opportunities',
        'difficulty-scaffolding',
        'adaptive-adjustment'
      ];
      
      const hasNewPrinciples = newPrinciples.some(p => 
        jsonData.design.designPrinciples.includes(p)
      );
      
      assert(hasNewPrinciples, '应至少包含一个新设计原则');
    }
    
    console.log('✓ JSON格式兼容性测试通过');
    return true;
  } catch (error) {
    console.error('✗ JSON格式兼容性测试失败:', error.message);
    return false;
  }
}

// 主测试函数
async function runAllTests() {
  console.log('开始输出测试...\n');
  
  const tests = [
    testJsonExporter,
    testConversationDriver,
    testPlatformAdapter,
    testJsonCompatibility
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
  testJsonExporter,
  testConversationDriver,
  testPlatformAdapter,
  testJsonCompatibility
};