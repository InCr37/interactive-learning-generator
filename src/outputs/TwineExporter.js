/**
 * Twine格式导出器
 * 
 * 生成符合Twine 2.0格式的HTML/JSON文件，可直接导入Twine编辑器。
 * 创建包含分支对话、选择点和叙事的交互式故事结构。
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class TwineExporter {
  /**
   * 导出为Twine格式
   * @param {Object} interactiveDesign - 互动学习设计
   * @param {string} outputDir - 输出目录
   * @param {Object} templateManager - 模板管理器
   * @returns {Promise<Object>} 导出结果
   */
  static async export(interactiveDesign, outputDir, templateManager) {
    console.log('导出为Twine格式');
    
    // 验证设计
    const errors = this.validateDesign(interactiveDesign);
    if (errors.length > 0) {
      throw new Error(`设计验证失败：${errors.join('；')}`);
    }
    
    // 创建输出目录
    const twineDir = path.join(outputDir, 'twine-export');
    await fs.ensureDir(twineDir);
    
    // 构建Twine故事结构
    const storyStructure = this.buildStoryStructure(interactiveDesign);
    
    // 渲染Twine模板
    const twineHtml = await templateManager.render('twine-base', {
      title: interactiveDesign.title,
      storyStructure,
      metadata: interactiveDesign.metadata,
      designPrinciples: interactiveDesign.designPrinciplesApplied,
      narrativeFramework: interactiveDesign.narrativeFramework
    });
    
    // 生成文件名
    const storyId = uuidv4().substring(0, 8);
    const filename = `interactive-learning-${storyId}.html`;
    const outputPath = path.join(twineDir, filename);
    
    // 写入文件
    await fs.writeFile(outputPath, twineHtml, 'utf-8');
    
    // 生成额外文件（如段落模板）
    const passageTemplate = await templateManager.render('twine-passage', {
      design: interactiveDesign
    });
    
    const passagePath = path.join(twineDir, 'passage-template.json');
    await fs.writeJson(passagePath, JSON.parse(passageTemplate), { spaces: 2 });
    
    // 创建故事数据文件（JSON格式，用于Twine导入）
    const storyData = this.createStoryData(interactiveDesign, storyStructure);
    const storyDataPath = path.join(twineDir, 'story-data.json');
    await fs.writeJson(storyDataPath, storyData, { spaces: 2 });
    
    return {
      mainOutputPath: outputPath,
      additionalFiles: [
        { path: passagePath, type: 'template', description: 'Twine段落模板' },
        { path: storyDataPath, type: 'data', description: 'Twine故事数据' }
      ],
      format: 'twine',
      storyId,
      importInstructions: '将此HTML文件导入Twine 2.0+编辑器，或使用story-data.json进行程序化导入'
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
      errors.push('缺少故事标题');
    }
    
    if (!interactiveDesign.interactiveModules || interactiveDesign.interactiveModules.length === 0) {
      errors.push('缺少互动模块');
    }
    
    return errors;
  }
  
  /**
   * 构建故事结构
   */
  static buildStoryStructure(interactiveDesign) {
    const { interactiveModules, narrativeFramework } = interactiveDesign;
    
    // 创建故事开始节点
    const storyStructure = {
      startNode: {
        id: 'start',
        title: '开始',
        content: this.createStartContent(interactiveDesign),
        tags: ['start'],
        links: []
      },
      passages: [],
      connections: []
    };
    
    // 将互动模块转换为Twine段落
    interactiveModules.forEach((module, index) => {
      const passage = this.convertModuleToPassage(module, index, interactiveDesign);
      storyStructure.passages.push(passage);
      
      // 创建连接
      if (index === 0) {
        // 第一个模块连接到开始节点
        storyStructure.connections.push({
          from: 'start',
          to: passage.id,
          label: '开始学习'
        });
      } else if (index < interactiveModules.length) {
        // 连接到前一个模块
        const prevPassage = storyStructure.passages[index - 1];
        storyStructure.connections.push({
          from: prevPassage.id,
          to: passage.id,
          label: '继续学习'
        });
      }
    });
    
    // 添加分支连接
    this.addBranchConnections(storyStructure, interactiveModules);
    
    return storyStructure;
  }
  
  /**
   * 创建开始内容
   */
  static createStartContent(interactiveDesign) {
    const { title, concepts, learningObjectives, narrativeFramework } = interactiveDesign;
    
    const conceptList = concepts.slice(0, 5).map(c => c.term).join('、');
    const objectiveSummary = learningObjectives.length > 0 ? 
      learningObjectives[0].text.substring(0, 50) + '...' : '掌握相关知识';
    
    return `
      <div class="twine-start">
        <h1>${title}</h1>
        <div class="story-intro">
          <p>欢迎开始学习之旅！在这个互动故事中，你将探索：</p>
          <ul>
            <li><strong>主要概念</strong>：${conceptList}${concepts.length > 5 ? '等' : ''}</li>
            <li><strong>学习目标</strong>：${objectiveSummary}</li>
            <li><strong>学习情境</strong>：${narrativeFramework.scenario || '知识探索环境'}</li>
          </ul>
          <p>准备好后，点击下方链接开始学习。</p>
        </div>
      </div>
    `;
  }
  
  /**
   * 将模块转换为Twine段落
   */
  static convertModuleToPassage(module, index, interactiveDesign) {
    const passageId = `passage_${index + 1}`;
    const { narrativeFramework } = interactiveDesign;
    
    // 根据模块类型生成内容
    let passageContent = '';
    
    switch (module.type) {
      case 'dialogue':
        passageContent = this.createDialoguePassage(module, narrativeFramework);
        break;
        
      case 'quiz':
        passageContent = this.createQuizPassage(module);
        break;
        
      case 'exercise':
        passageContent = this.createExercisePassage(module);
        break;
        
      default:
        passageContent = `<p>${module.content || '学习内容'}</p>`;
    }
    
    // 添加导航和反馈
    passageContent += this.createNavigationControls(module, index, interactiveDesign.interactiveModules.length);
    
    return {
      id: passageId,
      title: module.title || `模块 ${index + 1}`,
      content: passageContent,
      tags: [module.type, `module-${index + 1}`],
      metadata: {
        estimatedTime: module.estimatedTime,
        difficulty: module.difficulty,
        concepts: module.concepts
      }
    };
  }
  
  /**
   * 创建对话段落
   */
  static createDialoguePassage(module, narrativeFramework) {
    const guideName = narrativeFramework.neutral ? '学习助手' : '知识向导';
    
    let content = `<div class="dialogue-passage">`;
    
    if (module.introduction) {
      content += `
        <div class="dialogue-intro">
          <div class="guide-speech">${module.introduction.guide}</div>
          <div class="prompt">${module.introduction.prompt}</div>
        </div>
      `;
    }
    
    if (module.exploration) {
      content += `
        <div class="dialogue-exploration">
          <p>${module.exploration.replace(/\n/g, '</p><p>')}</p>
        </div>
      `;
    }
    
    if (module.branches && module.branches.length > 0) {
      content += `<div class="dialogue-branches">`;
      
      module.branches.forEach(branch => {
        content += `
          <div class="branch-section">
            <h3>${branch.prompt}</h3>
            <ul class="branch-options">
        `;
        
        branch.options.forEach(option => {
          const linkLabel = option.text.length > 30 ? 
            option.text.substring(0, 30) + '...' : option.text;
          
          content += `
            <li>
              <a href="${option.nextStep || '#'}" class="branch-link ${option.isCorrect ? 'correct' : 'incorrect'}">
                ${linkLabel}
              </a>
              <span class="branch-hint">${option.feedback}</span>
            </li>
          `;
        });
        
        content += `
            </ul>
          </div>
        `;
      });
      
      content += `</div>`;
    }
    
    content += `</div>`;
    return content;
  }
  
  /**
   * 创建选择题段落
   */
  static createQuizPassage(module) {
    let content = `<div class="quiz-passage">`;
    
    content += `
      <h2>${module.title}</h2>
      <p class="quiz-stem">${module.questionStem}</p>
      <form class="quiz-form">
    `;
    
    module.options.forEach(option => {
      const inputType = module.questionType === 'multiple-choice' ? 'checkbox' : 'radio';
      const name = module.questionType === 'multiple-choice' ? `option_${option.id}` : 'quiz_option';
      
      content += `
        <div class="quiz-option">
          <input type="${inputType}" id="${option.id}" name="${name}" value="${option.id}">
          <label for="${option.id}">${option.text}</label>
        </div>
      `;
    });
    
    content += `
        <button type="button" class="submit-quiz">提交答案</button>
      </form>
      <div class="quiz-feedback" style="display: none;">
        <p>${module.feedback}</p>
      </div>
    </div>
    `;
    
    return content;
  }
  
  /**
   * 创建练习段落
   */
  static createExercisePassage(module) {
    let content = `<div class="exercise-passage">`;
    
    content += `
      <h2>${module.title}</h2>
      <div class="exercise-scenario">
        <p>${module.scenario}</p>
      </div>
      <div class="exercise-task">
        <h3>任务：</h3>
        <p>${module.task}</p>
      </div>
      <div class="exercise-steps">
        <h3>步骤指导：</h3>
        <ol>
    `;
    
    module.steps.forEach(step => {
      content += `
        <li>
          <strong>${step.description}</strong>
          <p>${step.guidance}</p>
        </li>
      `;
    });
    
    content += `
        </ol>
      </div>
      <div class="exercise-hints">
        <h3>提示：</h3>
        <ul>
    `;
    
    module.hints.forEach(hint => {
      content += `<li>${hint.text}</li>`;
    });
    
    content += `
        </ul>
      </div>
      <div class="exercise-feedback" style="display: none;">
        <p>${module.feedback.success}</p>
      </div>
    </div>
    `;
    
    return content;
  }
  
  /**
   * 创建导航控制
   */
  static createNavigationControls(module, index, totalModules) {
    let navHtml = `<div class="passage-navigation">`;
    
    if (index > 0) {
      navHtml += `<a href="[[prev]]" class="nav-link prev-link">上一部分</a> `;
    }
    
    if (index < totalModules - 1) {
      navHtml += `<a href="[[next]]" class="nav-link next-link">下一部分</a>`;
    } else {
      navHtml += `<a href="[[end]]" class="nav-link end-link">完成学习</a>`;
    }
    
    navHtml += `</div>`;
    return navHtml;
  }
  
  /**
   * 添加分支连接
   */
  static addBranchConnections(storyStructure, interactiveModules) {
    // 这里实现分支连接的逻辑
    // 简化版：为每个模块添加分支选项
    interactiveModules.forEach((module, index) => {
      if (module.branches && module.branches.length > 0) {
        module.branches.forEach(branch => {
          branch.options.forEach(option => {
            // 简化的连接逻辑
            storyStructure.connections.push({
              from: `passage_${index + 1}`,
              to: option.nextStep || `passage_${index + 2}`,
              label: option.text.substring(0, 20)
            });
          });
        });
      }
    });
  }
  
  /**
   * 创建故事数据
   */
  static createStoryData(interactiveDesign, storyStructure) {
    return {
      storyFormat: 'SugarCube',
      formatVersion: '2.0',
      title: interactiveDesign.title,
      creator: '渐进式互动学习生成器',
      ifid: uuidv4().toUpperCase(),
      passages: storyStructure.passages.map(passage => ({
        pid: passage.id,
        title: passage.title,
        content: passage.content,
        tags: passage.tags.join(' ')
      })),
      startPassage: 'start'
    };
  }
}

module.exports = TwineExporter;