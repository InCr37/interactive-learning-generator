/**
 * 模板管理器
 * 
 * 管理Handlebars模板和渲染逻辑，支持多种输出格式的模板。
 * 提供模板加载、编译、缓存和渲染功能。
 */

const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');

class TemplateManager {
  constructor() {
    this.templates = new Map();
    this.templateDir = path.join(__dirname, '../../templates');
    this.initialized = false;
    
    // 注册自定义Handlebars助手
    this.registerHelpers();
  }
  
  /**
   * 初始化模板管理器
   */
  async init() {
    if (this.initialized) return;
    
    console.log('初始化模板管理器');
    
    try {
      // 加载所有模板
      await this.loadAllTemplates();
      this.initialized = true;
      console.log(`模板管理器初始化完成，加载了 ${this.templates.size} 个模板`);
    } catch (error) {
      console.error('模板管理器初始化失败：', error);
      throw error;
    }
  }
  
  /**
   * 加载所有模板
   */
  async loadAllTemplates() {
    // 加载Twine模板
    await this.loadTemplateCategory('twine', ['base', 'passage']);
    
    // 加载HTML模板
    await this.loadTemplateCategory('html', ['demo', 'styles', 'scripts']);
    
    // 加载JSON模板
    await this.loadTemplateCategory('json', ['structure']);
  }
  
  /**
   * 加载模板类别
   */
  async loadTemplateCategory(category, templateNames) {
    const categoryDir = path.join(this.templateDir, category);
    
    // 检查目录是否存在
    if (!await fs.pathExists(categoryDir)) {
      console.log(`模板目录不存在，创建默认模板：${categoryDir}`);
      await this.createDefaultTemplates(category, templateNames);
    }
    
    // 加载模板
    for (const name of templateNames) {
      const templatePath = path.join(categoryDir, `${name}.hbs`);
      
      try {
        if (await fs.pathExists(templatePath)) {
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const templateKey = `${category}-${name}`;
          this.templates.set(templateKey, Handlebars.compile(templateContent));
          console.log(`加载模板：${templateKey}`);
        } else {
          // 创建默认模板
          await this.createDefaultTemplate(category, name);
          const templateContent = await fs.readFile(templatePath, 'utf-8');
          const templateKey = `${category}-${name}`;
          this.templates.set(templateKey, Handlebars.compile(templateContent));
          console.log(`创建并加载默认模板：${templateKey}`);
        }
      } catch (error) {
        console.error(`加载模板失败：${templatePath}`, error);
        // 创建内存中的默认模板
        this.createInMemoryTemplate(category, name);
      }
    }
  }
  
  /**
   * 创建默认模板
   */
  async createDefaultTemplates(category, templateNames) {
    const categoryDir = path.join(this.templateDir, category);
    await fs.ensureDir(categoryDir);
    
    for (const name of templateNames) {
      await this.createDefaultTemplate(category, name);
    }
  }
  
  /**
   * 创建默认模板文件
   */
  async createDefaultTemplate(category, name) {
    const templatePath = path.join(this.templateDir, category, `${name}.hbs`);
    const defaultContent = this.getDefaultTemplateContent(category, name);
    
    await fs.writeFile(templatePath, defaultContent, 'utf-8');
  }
  
  /**
   * 创建内存中的模板
   */
  createInMemoryTemplate(category, name) {
    const templateKey = `${category}-${name}`;
    const defaultContent = this.getDefaultTemplateContent(category, name);
    this.templates.set(templateKey, Handlebars.compile(defaultContent));
    console.log(`创建内存模板：${templateKey}`);
  }
  
  /**
   * 获取默认模板内容
   */
  getDefaultTemplateContent(category, name) {
    const templates = {
      'twine-base': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - 互动学习故事</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f7fa; }
    .twine-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .twine-passage { margin: 20px 0; }
    .twine-link { color: #3498db; text-decoration: none; padding: 5px 10px; border: 1px solid #3498db; border-radius: 4px; margin: 5px; display: inline-block; }
    .twine-link:hover { background: #3498db; color: white; }
    .dialogue-guide { color: #2c3e50; font-weight: bold; }
    .dialogue-learner { color: #27ae60; }
    .quiz-option { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    .exercise-step { margin: 15px 0; padding-left: 20px; }
  </style>
</head>
<body>
  <div class="twine-container">
    <h1>{{title}}</h1>
    <div id="twine-content">
      <!-- 故事内容将通过JavaScript动态加载 -->
      <p>加载互动学习故事...</p>
    </div>
    <div id="twine-navigation" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <button id="prev-btn">上一页</button>
      <button id="next-btn">下一页</button>
    </div>
  </div>
  
  <script>
    // 简化的Twine故事数据
    const storyData = {{{stringify storyStructure}}};
    
    // 简化的渲染逻辑
    function renderPassage(passageId) {
      const passage = storyData.passages.find(p => p.id === passageId) || storyData.startNode;
      const contentDiv = document.getElementById('twine-content');
      
      if (passage) {
        contentDiv.innerHTML = passage.content;
      }
    }
    
    // 初始渲染
    document.addEventListener('DOMContentLoaded', () => {
      renderPassage('start');
    });
  </script>
</body>
</html>`,
      
      'twine-passage': `{
  "passageTemplate": {
    "id": "{{id}}",
    "title": "{{title}}",
    "content": "{{content}}",
    "tags": "{{tags}}"
  },
  "designInfo": {
    "title": "{{design.title}}",
    "conceptCount": {{design.concepts.length}},
    "moduleCount": {{design.interactiveModules.length}}
  }
}`,
      
      'html-demo': `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} - 互动学习演示</title>
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <div class="learning-container">
    <header class="learning-header">
      <h1>{{title}}</h1>
      <div class="learning-meta">
        <span class="meta-item">模块: {{learningData.metadata.totalModules}}</span>
        <span class="meta-item">概念: {{learningData.metadata.totalConcepts}}</span>
        <span class="meta-item">预计时间: {{learningData.metadata.estimatedLearningTime}}分钟</span>
      </div>
    </header>
    
    <main class="learning-main">
      <div class="module-navigation">
        <nav id="module-nav">
          <!-- 模块导航将通过JavaScript动态生成 -->
        </nav>
      </div>
      
      <div class="module-container">
        <div id="current-module">
          <div class="welcome-message">
            <h2>欢迎开始学习！</h2>
            <p>点击左侧导航开始学习第一个模块。</p>
          </div>
        </div>
      </div>
      
      <div class="learning-sidebar">
        <div class="concepts-panel">
          <h3>学习概念</h3>
          <ul id="concepts-list">
            <!-- 概念列表将通过JavaScript动态生成 -->
          </ul>
        </div>
        
        <div class="progress-panel">
          <h3>学习进度</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: 0%"></div>
          </div>
          <p id="progress-text">0/{{learningData.metadata.totalModules}} 完成</p>
        </div>
      </div>
    </main>
    
    <footer class="learning-footer">
      <p>由渐进式互动学习生成器创建 • {{timestamp}}</p>
    </footer>
  </div>
  
  <script src="assets/interactive.js"></script>
  <script>
    // 初始化学习数据
    window.learningData = {{{stringify learningData}}};
    window.currentModuleIndex = 0;
    
    // 启动学习应用
    document.addEventListener('DOMContentLoaded', () => {
      if (window.LearningApp) {
        window.LearningApp.init();
      }
    });
  </script>
</body>
</html>`,
      
      'html-styles': `/* 渐进式互动学习生成器 - 默认样式 */
/* 设计原则：中性、专业、教育导向 */

:root {
  --primary-color: #3498db;
  --secondary-color: #2c3e50;
  --accent-color: #27ae60;
  --background-color: #f5f7fa;
  --surface-color: #ffffff;
  --text-primary: #2c3e50;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --error-color: #e74c3c;
  --info-color: #3498db;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--background-color);
}

.learning-container {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.learning-header {
  background: var(--surface-color);
  padding: 20px 30px;
  border-bottom: 2px solid var(--primary-color);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.learning-header h1 {
  color: var(--secondary-color);
  margin-bottom: 10px;
  font-size: 1.8em;
}

.learning-meta {
  display: flex;
  gap: 20px;
  color: var(--text-secondary);
  font-size: 0.9em;
}

.meta-item {
  padding: 4px 12px;
  background: var(--background-color);
  border-radius: 12px;
}

/* 主内容区 */
.learning-main {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
}

.module-navigation {
  flex: 0 0 250px;
  background: var(--surface-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.module-container {
  flex: 1;
  background: var(--surface-color);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.learning-sidebar {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 模块导航 */
#module-nav ul {
  list-style: none;
}

.module-nav-item {
  padding: 12px 16px;
  margin: 8px 0;
  background: var(--background-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.module-nav-item:hover {
  background: #e8f4fc;
  border-left: 3px solid var(--primary-color);
}

.module-nav-item.active {
  background: #e8f4fc;
  border-left: 3px solid var(--primary-color);
  font-weight: bold;
}

.module-nav-item.completed {
  color: var(--success-color);
}

/* 概念面板 */
.concepts-panel {
  background: var(--surface-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.concepts-panel h3 {
  margin-bottom: 15px;
  color: var(--secondary-color);
}

#concepts-list {
  list-style: none;
}

.concept-item {
  display: inline-block;
  background: #e3f2fd;
  color: var(--primary-color);
  padding: 6px 12px;
  margin: 4px;
  border-radius: 15px;
  font-size: 0.85em;
}

/* 进度面板 */
.progress-panel {
  background: var(--surface-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.progress-panel h3 {
  margin-bottom: 15px;
  color: var(--secondary-color);
}

.progress-bar {
  height: 10px;
  background: var(--border-color);
  border-radius: 5px;
  overflow: hidden;
  margin: 15px 0;
}

.progress-fill {
  height: 100%;
  background: var(--success-color);
  transition: width 0.3s ease;
}

#progress-text {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9em;
}

/* 模块内容样式 */
.module-content {
  min-height: 400px;
}

.dialogue-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.dialogue-bubble {
  margin: 15px 0;
  padding: 15px;
  border-radius: 8px;
  max-width: 80%;
}

.guide-bubble {
  background: #e3f2fd;
  margin-right: auto;
}

.learner-bubble {
  background: #e8f5e8;
  margin-left: auto;
}

.branch-options {
  margin: 20px 0;
}

.branch-option {
  display: block;
  padding: 12px 20px;
  margin: 10px 0;
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.branch-option:hover {
  border-color: var(--primary-color);
  background: #f0f8ff;
}

/* 页脚 */
.learning-footer {
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  font-size: 0.9em;
  border-top: 1px solid var(--border-color);
  background: var(--surface-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .learning-main {
    flex-direction: column;
  }
  
  .module-navigation,
  .learning-sidebar {
    flex: none;
    width: 100%;
  }
}`,
      
      'html-scripts': `// 渐进式互动学习生成器 - 交互脚本
// 处理模块导航、内容渲染、进度跟踪等功能

class LearningApp {
  constructor() {
    this.currentModuleIndex = 0;
    this.completedModules = new Set();
    this.learningData = window.learningData || {};
    this.narrativeFramework = this.learningData.narrative || {};
  }
  
  init() {
    console.log('初始化学习应用');
    
    // 初始化UI组件
    this.initModuleNavigation();
    this.initConceptsList();
    this.initProgressTracker();
    
    // 加载第一个模块
    this.loadModule(0);
    
    // 设置事件监听器
    this.setupEventListeners();
  }
  
  initModuleNavigation() {
    const navContainer = document.getElementById('module-nav');
    if (!navContainer) return;
    
    const modules = this.learningData.modules || [];
    const navList = document.createElement('ul');
    
    modules.forEach((module, index) => {
      const navItem = document.createElement('li');
      navItem.className = 'module-nav-item';
      if (index === 0) navItem.classList.add('active');
      if (this.completedModules.has(module.id)) navItem.classList.add('completed');
      
      navItem.textContent = \`\${index + 1}. \${module.title}\`;
      navItem.dataset.moduleIndex = index;
      
      navItem.addEventListener('click', () => {
        this.loadModule(index);
        this.updateActiveNavItem(index);
      });
      
      navList.appendChild(navItem);
    });
    
    navContainer.appendChild(navList);
  }
  
  initConceptsList() {
    const conceptsList = document.getElementById('concepts-list');
    if (!conceptsList || !this.learningData.concepts) return;
    
    this.learningData.concepts.forEach(concept => {
      const conceptItem = document.createElement('li');
      conceptItem.className = 'concept-item';
      conceptItem.textContent = concept.term;
      conceptItem.title = concept.definition || concept.term;
      conceptsList.appendChild(conceptItem);
    });
  }
  
  initProgressTracker() {
    this.updateProgressDisplay();
  }
  
  setupEventListeners() {
    // 添加键盘导航支持
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        this.nextModule();
      } else if (e.key === 'ArrowLeft') {
        this.previousModule();
      }
    });
  }
  
  loadModule(moduleIndex) {
    const modules = this.learningData.modules || [];
    if (moduleIndex < 0 || moduleIndex >= modules.length) return;
    
    this.currentModuleIndex = moduleIndex;
    const module = modules[moduleIndex];
    
    // 更新当前模块显示
    const moduleContainer = document.getElementById('current-module');
    if (!moduleContainer) return;
    
    // 根据模块类型渲染内容
    let moduleContent = '';
    
    switch (module.type) {
      case 'dialogue':
        moduleContent = this.renderDialogueModule(module);
        break;
      case 'quiz':
        moduleContent = this.renderQuizModule(module);
        break;
      case 'exercise':
        moduleContent = this.renderExerciseModule(module);
        break;
      default:
        moduleContent = \`<div class="module-content"><h2>\${module.title}</h2><p>\${module.content || ''}</p></div>\`;
    }
    
    moduleContainer.innerHTML = moduleContent;
    
    // 标记为已查看（如果未完成）
    if (!this.completedModules.has(module.id)) {
      this.completedModules.add(module.id);
      this.updateProgressDisplay();
      this.updateModuleNavigation();
    }
    
    // 滚动到顶部
    window.scrollTo(0, 0);
  }
  
  renderDialogueModule(module) {
    const dialogueData = module.dialogueData || {};
    let html = \`
      <div class="module-content">
        <h2>\${module.title}</h2>
        <div class="dialogue-section">
    \`;
    
    // 介绍部分
    if (dialogueData.introduction) {
      html += \`
        <div class="dialogue-bubble guide-bubble">
          \${dialogueData.introduction.guide || ''}
        </div>
        <div class="dialogue-prompt">
          \${dialogueData.introduction.prompt || ''}
        </div>
      \`;
    }
    
    // 探索部分
    if (dialogueData.exploration) {
      html += \`
        <div class="dialogue-exploration">
          \${dialogueData.exploration}
        </div>
      \`;
    }
    
    // 分支选项
    if (dialogueData.branches && dialogueData.branches.length > 0) {
      html += '<div class="branch-options">';
      
      dialogueData.branches.forEach(branch => {
        html += \`
          <div class="branch-section">
            <h4>\${branch.prompt}</h4>
        \`;
        
        if (branch.options && branch.options.length > 0) {
          branch.options.forEach(option => {
            html += \`
              <button class="branch-option" data-feedback="\${option.feedback || ''}">
                \${option.text}
              </button>
            \`;
          });
        }
        
        html += '</div>';
      });
      
      html += '</div>';
    }
    
    html += \`
        </div>
      </div>
    \`;
    
    return html;
  }
  
  renderQuizModule(module) {
    const quizData = module.quizData || {};
    let html = \`
      <div class="module-content">
        <h2>\${module.title}</h2>
        <div class="quiz-section">
          <p class="quiz-stem">\${quizData.questionStem || ''}</p>
          <form class="quiz-form">
    \`;
    
    // 选项
    if (quizData.options && quizData.options.length > 0) {
      const inputType = quizData.questionType === 'multiple-choice' ? 'checkbox' : 'radio';
      const name = quizData.questionType === 'multiple-choice' ? 'quiz-options' : 'quiz-option';
      
      quizData.options.forEach((option, index) => {
        html += \`
          <div class="quiz-option">
            <input type="\${inputType}" id="option-\${index}" name="\${name}" value="\${option.id}">
            <label for="option-\${index}">\${option.text}</label>
          </div>
        \`;
      });
    }
    
    html += \`
            <button type="button" class="submit-quiz">提交答案</button>
          </form>
          <div class="quiz-feedback" style="display: none;">
            <p>\${quizData.feedback || ''}</p>
          </div>
        </div>
      </div>
    \`;
    
    return html;
  }
  
  renderExerciseModule(module) {
    const exerciseData = module.exerciseData || {};
    let html = \`
      <div class="module-content">
        <h2>\${module.title}</h2>
        <div class="exercise-section">
    \`;
    
    // 场景
    if (exerciseData.scenario) {
      html += \`
        <div class="exercise-scenario">
          <h3>场景</h3>
          <p>\${exerciseData.scenario}</p>
        </div>
      \`;
    }
    
    // 任务
    if (exerciseData.task) {
      html += \`
        <div class="exercise-task">
          <h3>任务</h3>
          <p>\${exerciseData.task}</p>
        </div>
      \`;
    }
    
    // 步骤
    if (exerciseData.steps && exerciseData.steps.length > 0) {
      html += '<div class="exercise-steps"><h3>步骤指导</h3><ol>';
      
      exerciseData.steps.forEach(step => {
        html += \`
          <li>
            <strong>\${step.description}</strong>
            <p>\${step.guidance}</p>
          </li>
        \`;
      });
      
      html += '</ol></div>';
    }
    
    // 提示
    if (exerciseData.hints && exerciseData.hints.length > 0) {
      html += '<div class="exercise-hints"><h3>提示</h3><ul>';
      
      exerciseData.hints.forEach(hint => {
        html += \`<li>\${hint.text}</li>\`;
      });
      
      html += '</ul></div>';
    }
    
    html += \`
          <button class="complete-exercise">完成练习</button>
          <div class="exercise-feedback" style="display: none;">
            <p>\${exerciseData.feedback?.success || '完成得很好！'}</p>
          </div>
        </div>
      </div>
    \`;
    
    return html;
  }
  
  nextModule() {
    const modules = this.learningData.modules || [];
    if (this.currentModuleIndex < modules.length - 1) {
      this.loadModule(this.currentModuleIndex + 1);
      this.updateActiveNavItem(this.currentModuleIndex + 1);
    }
  }
  
  previousModule() {
    if (this.currentModuleIndex > 0) {
      this.loadModule(this.currentModuleIndex - 1);
      this.updateActiveNavItem(this.currentModuleIndex - 1);
    }
  }
  
  updateActiveNavItem(moduleIndex) {
    const navItems = document.querySelectorAll('.module-nav-item');
    navItems.forEach((item, index) => {
      if (index === moduleIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  updateModuleNavigation() {
    const navItems = document.querySelectorAll('.module-nav-item');
    navItems.forEach((item, index) => {
      const moduleId = this.learningData.modules?.[index]?.id;
      if (moduleId && this.completedModules.has(moduleId)) {
        item.classList.add('completed');
      }
    });
  }
  
  updateProgressDisplay() {
    const totalModules = this.learningData.modules?.length || 0;
    const completedCount = this.completedModules.size;
    const progressPercent = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
    
    // 更新进度条
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      progressFill.style.width = \`\${progressPercent}%\`;
    }
    
    // 更新进度文本
    const progressText = document.getElementById('progress-text');
    if (progressText) {
      progressText.textContent = \`\${completedCount}/\${totalModules} 完成\`;
    }
  }
}

// 导出到全局
window.LearningApp = LearningApp;`,
      
      'json-structure': `{
  "metadata": {
    "id": "{{id}}",
    "title": "{{title}}",
    "version": "{{version}}",
    "created": "{{created}}",
    "generator": "渐进式互动学习生成器",
    "formatVersion": "1.0"
  },
  "design": {
    "targetAudience": "{{targetAudience}}",
    "designPrinciples": "{{designPrinciples}}",
    "narrativeFramework": "{{narrativeFramework}}"
  },
  "content": {
    "concepts": [],
    "learningObjectives": [],
    "modules": []
  },
  "progression": {
    "moduleOrder": [],
    "conceptProgression": {},
    "learningPath": {}
  },
  "analytics": {
    "totalModules": 0,
    "totalConcepts": 0,
    "totalObjectives": 0,
    "estimatedLearningTime": 0
  }
}`
    };
    
    const templateKey = `${category}-${name}`;
    return templates[templateKey] || `<!-- 模板 ${templateKey} -->`;
  }
  
  /**
   * 注册Handlebars助手
   */
  registerHelpers() {
    // JSON字符串化助手
    Handlebars.registerHelper('stringify', function(context) {
      return JSON.stringify(context);
    });
    
    // 截断文本助手
    Handlebars.registerHelper('truncate', function(str, len) {
      if (str && str.length > len) {
        return str.substring(0, len) + '...';
      }
      return str;
    });
    
    // 条件比较助手
    Handlebars.registerHelper('eq', function(a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });
    
    // 循环索引助手
    Handlebars.registerHelper('inc', function(value) {
      return parseInt(value) + 1;
    });
  }
  
  /**
   * 渲染模板
   */
  async render(templateName, context) {
    if (!this.initialized) {
      await this.init();
    }
    
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`模板不存在：${templateName}`);
    }
    
    try {
      return template(context);
    } catch (error) {
      console.error(`模板渲染失败：${templateName}`, error);
      throw new Error(`模板渲染失败：${error.message}`);
    }
  }
  
  /**
   * 获取模板列表
   */
  getTemplateList() {
    return Array.from(this.templates.keys());
  }
  
  /**
   * 清除模板缓存
   */
  clearCache() {
    this.templates.clear();
    this.initialized = false;
  }
}

module.exports = TemplateManager;