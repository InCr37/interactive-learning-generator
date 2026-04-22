/**
 * HTML演示生成器
 * 
 * 创建可直接在浏览器中运行的互动学习模块。
 * 生成包含完整交互功能、样式和脚本的HTML页面。
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class HtmlDemoGenerator {
  /**
   * 生成HTML演示
   * @param {Object} interactiveDesign - 互动学习设计
   * @param {string} outputDir - 输出目录
   * @param {Object} templateManager - 模板管理器
   * @returns {Promise<Object>} 生成结果
   */
  static async generate(interactiveDesign, outputDir, templateManager) {
    console.log('生成HTML演示');
    
    // 验证设计
    const errors = this.validateDesign(interactiveDesign);
    if (errors.length > 0) {
      throw new Error(`设计验证失败：${errors.join('；')}`);
    }
    
    // 创建输出目录
    const htmlDir = path.join(outputDir, 'html-demo');
    await fs.ensureDir(htmlDir);
    
    // 创建资源目录
    const assetsDir = path.join(htmlDir, 'assets');
    await fs.ensureDir(assetsDir);
    
    // 生成学习模块数据
    const learningData = this.prepareLearningData(interactiveDesign);
    
    // 渲染HTML模板
    const htmlContent = await templateManager.render('html-demo', {
      title: interactiveDesign.title,
      learningData,
      design: interactiveDesign,
      timestamp: new Date().toISOString(),
      demoId: uuidv4().substring(0, 8)
    });
    
    // 生成文件名
    const filename = `interactive-learning-demo.html`;
    const outputPath = path.join(htmlDir, filename);
    
    // 写入HTML文件
    await fs.writeFile(outputPath, htmlContent, 'utf-8');
    
    // 生成CSS文件
    const cssContent = await templateManager.render('html-styles', {
      design: interactiveDesign,
      neutralInterface: interactiveDesign.narrativeFramework?.neutral !== false
    });
    
    const cssPath = path.join(assetsDir, 'styles.css');
    await fs.writeFile(cssPath, cssContent, 'utf-8');
    
    // 生成JavaScript文件
    const jsContent = await templateManager.render('html-scripts', {
      learningData,
      design: interactiveDesign
    });
    
    const jsPath = path.join(assetsDir, 'interactive.js');
    await fs.writeFile(jsPath, jsContent, 'utf-8');
    
    // 生成模块数据文件（JSON）
    const dataPath = path.join(assetsDir, 'learning-data.json');
    await fs.writeJson(dataPath, learningData, { spaces: 2 });
    
    return {
      mainOutputPath: outputPath,
      additionalFiles: [
        { path: cssPath, type: 'stylesheet', description: '样式表' },
        { path: jsPath, type: 'script', description: '交互脚本' },
        { path: dataPath, type: 'data', description: '学习数据' }
      ],
      format: 'html',
      assetsDir,
      openInstructions: '在浏览器中打开HTML文件即可开始学习'
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
    
    if (!interactiveDesign.interactiveModules || interactiveDesign.interactiveModules.length === 0) {
      errors.push('缺少互动模块');
    }
    
    return errors;
  }
  
  /**
   * 准备学习数据
   */
  static prepareLearningData(interactiveDesign) {
    const { 
      title, 
      interactiveModules, 
      concepts, 
      learningObjectives,
      narrativeFramework,
      designPrinciplesApplied,
      metadata 
    } = interactiveDesign;
    
    // 格式化概念数据
    const formattedConcepts = concepts.map(concept => ({
      id: concept.id,
      term: concept.term,
      definition: concept.definition || '',
      type: concept.type || 'generic'
    }));
    
    // 格式化学习目标
    const formattedObjectives = learningObjectives.map(obj => ({
      id: obj.id,
      text: obj.text,
      bloomLevel: obj.bloomLevel || '理解'
    }));
    
    // 格式化互动模块
    const formattedModules = interactiveModules.map((module, index) => {
      const baseModule = {
        id: module.id || `module_${index + 1}`,
        type: module.type,
        title: module.title,
        order: module.order || index + 1,
        estimatedTime: module.estimatedTime || 5,
        difficulty: module.difficulty || 5
      };
      
      // 根据模块类型添加特定数据
      switch (module.type) {
        case 'dialogue':
          return {
            ...baseModule,
            dialogueData: {
              introduction: module.introduction,
              exploration: module.exploration,
              branches: module.branches,
              conclusion: module.conclusion
            }
          };
          
        case 'quiz':
          return {
            ...baseModule,
            quizData: {
              questionType: module.questionType,
              questionStem: module.questionStem,
              options: module.options,
              correctAnswers: module.correctAnswers,
              feedback: module.feedback
            }
          };
          
        case 'exercise':
          return {
            ...baseModule,
            exerciseData: {
              scenario: module.scenario,
              task: module.task,
              steps: module.steps,
              hints: module.hints,
              feedback: module.feedback
            }
          };
          
        default:
          return {
            ...baseModule,
            content: module.content || ''
          };
      }
    });
    
    return {
      title,
      concepts: formattedConcepts,
      learningObjectives: formattedObjectives,
      modules: formattedModules,
      narrative: {
        theme: narrativeFramework?.theme || '知识探索',
        scenario: narrativeFramework?.scenario || '学习环境',
        characters: narrativeFramework?.characters || {},
        settings: narrativeFramework?.settings || []
      },
      designPrinciples: designPrinciplesApplied,
      metadata: {
        ...metadata,
        totalModules: formattedModules.length,
        totalConcepts: formattedConcepts.length,
        totalObjectives: formattedObjectives.length
      }
    };
  }
  
  /**
   * 生成HTML预览（简化版，用于快速查看）
   */
  static async generateQuickPreview(interactiveDesign, outputDir) {
    console.log('生成快速预览');
    
    const previewDir = path.join(outputDir, 'quick-preview');
    await fs.ensureDir(previewDir);
    
    // 准备简化数据
    const simplifiedData = this.simplifyForPreview(interactiveDesign);
    
    // 生成HTML
    const html = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${interactiveDesign.title} - 预览</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f7fa; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
          .module { margin: 20px 0; padding: 15px; border-left: 4px solid #3498db; background: #f8f9fa; }
          .module h3 { margin-top: 0; color: #2c3e50; }
          .concept { display: inline-block; background: #e3f2fd; padding: 5px 10px; margin: 5px; border-radius: 15px; font-size: 0.9em; }
          .stats { display: flex; justify-content: space-between; margin: 20px 0; padding: 15px; background: #e8f5e8; border-radius: 5px; }
          .stat-item { text-align: center; }
          .stat-value { font-size: 1.5em; font-weight: bold; color: #27ae60; }
          .stat-label { font-size: 0.9em; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${interactiveDesign.title}</h1>
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${simplifiedData.moduleCount}</div>
              <div class="stat-label">互动模块</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${simplifiedData.conceptCount}</div>
              <div class="stat-label">学习概念</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${simplifiedData.estimatedTime}分钟</div>
              <div class="stat-label">预计时间</div>
            </div>
          </div>
          
          <h2>学习概念</h2>
          <div>
            ${simplifiedData.concepts.map(concept => 
              `<span class="concept">${concept}</span>`
            ).join('')}
          </div>
          
          <h2>互动模块预览</h2>
          ${simplifiedData.modules.map(module => `
            <div class="module">
              <h3>${module.title} (${module.type})</h3>
              <p>预计时间：${module.estimatedTime}分钟 | 难度：${module.difficulty}/10</p>
              ${module.preview ? `<p>${module.preview}</p>` : ''}
            </div>
          `).join('')}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em;">
            <p>由渐进式互动学习生成器创建 - ${new Date().toLocaleDateString()}</p>
            <p>注：这是简化预览版，完整交互功能需要完整HTML演示。</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const outputPath = path.join(previewDir, 'preview.html');
    await fs.writeFile(outputPath, html, 'utf-8');
    
    return {
      mainOutputPath: outputPath,
      format: 'html-preview',
      simplified: true
    };
  }
  
  /**
   * 简化数据用于预览
   */
  static simplifyForPreview(interactiveDesign) {
    const modules = interactiveDesign.interactiveModules || [];
    
    return {
      title: interactiveDesign.title,
      moduleCount: modules.length,
      conceptCount: interactiveDesign.concepts?.length || 0,
      estimatedTime: interactiveDesign.metadata?.estimatedLearningTime || 30,
      concepts: (interactiveDesign.concepts || []).slice(0, 10).map(c => c.term),
      modules: modules.slice(0, 5).map(module => ({
        title: module.title || `模块`,
        type: module.type || 'generic',
        estimatedTime: module.estimatedTime || 5,
        difficulty: module.difficulty || 5,
        preview: this.generateModulePreview(module)
      }))
    };
  }
  
  /**
   * 生成模块预览
   */
  static generateModulePreview(module) {
    switch (module.type) {
      case 'dialogue':
        return module.introduction?.prompt || '分支对话互动';
      case 'quiz':
        return module.questionStem?.substring(0, 50) + '...' || '选择题检查点';
      case 'exercise':
        return module.scenario?.substring(0, 50) + '...' || '实践练习';
      default:
        return '学习内容';
    }
  }
}

module.exports = HtmlDemoGenerator;