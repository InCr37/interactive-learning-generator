/**
 * 输出渲染器 - 协调不同格式的输出生成
 * 
 * 将互动学习设计渲染为不同格式：
 * - Twine故事格式：可直接导入Twine编辑器
 * - HTML交互演示：可在浏览器中直接运行
 * - JSON结构：用于进一步处理的结构化数据
 */

const TwineExporter = require('./TwineExporter');
const HtmlDemoGenerator = require('./HtmlDemoGenerator');
const JsonExporter = require('./JsonExporter');
const TemplateManager = require('./TemplateManager');

class OutputRenderer {
  /**
   * 渲染输出
   * @param {Object} interactiveDesign - 互动学习设计
   * @param {Object} options - 渲染选项
   * @returns {Promise<Object>} 渲染结果
   */
  static async render(interactiveDesign, options = {}) {
    console.log(`渲染输出，格式：${options.format}`);
    
    const { format = 'html', outputDir = '.' } = options;
    
    // 初始化模板管理器
    const templateManager = new TemplateManager();
    await templateManager.init();
    
    // 根据格式选择渲染器
    let renderResult;
    
    switch (format.toLowerCase()) {
      case 'twine':
        renderResult = await TwineExporter.export(interactiveDesign, outputDir, templateManager);
        break;
        
      case 'html':
        renderResult = await HtmlDemoGenerator.generate(interactiveDesign, outputDir, templateManager);
        break;
        
      case 'json':
        renderResult = await JsonExporter.export(interactiveDesign, outputDir, templateManager);
        break;
        
      default:
        throw new Error(`不支持的输出格式：${format}`);
    }
    
    // 记录生成的输出文件
    const generatedFiles = this.collectGeneratedFiles(renderResult, outputDir);
    
    return {
      outputPath: renderResult.mainOutputPath,
      generatedFiles,
      format,
      renderTime: new Date().toISOString()
    };
  }
  
  /**
   * 收集生成的文件
   */
  static collectGeneratedFiles(renderResult, outputDir) {
    const files = [];
    
    // 添加主输出文件
    if (renderResult.mainOutputPath) {
      files.push({
        path: renderResult.mainOutputPath,
        type: 'main',
        description: '主输出文件'
      });
    }
    
    // 添加额外文件
    if (renderResult.additionalFiles && Array.isArray(renderResult.additionalFiles)) {
      renderResult.additionalFiles.forEach(file => {
        files.push({
          path: file.path,
          type: file.type || 'additional',
          description: file.description || '额外文件'
        });
      });
    }
    
    // 添加资源文件（如果有）
    if (renderResult.resources && Array.isArray(renderResult.resources)) {
      renderResult.resources.forEach(resource => {
        files.push({
          path: resource.path,
          type: 'resource',
          description: resource.description || '资源文件'
        });
      });
    }
    
    return files;
  }
  
  /**
   * 获取支持格式列表
   */
  static getSupportedFormats() {
    return [
      { id: 'twine', name: 'Twine故事格式', description: '可直接导入Twine编辑器进行进一步编辑' },
      { id: 'html', name: 'HTML交互演示', description: '在浏览器中直接运行的完整学习模块' },
      { id: 'json', name: 'JSON结构数据', description: '用于集成到其他学习平台的结构化数据' }
    ];
  }
  
  /**
   * 验证设计是否可渲染
   */
  static validateDesignForRendering(interactiveDesign) {
    const errors = [];
    
    if (!interactiveDesign) {
      errors.push('缺少互动学习设计');
      return errors;
    }
    
    if (!interactiveDesign.interactiveModules || interactiveDesign.interactiveModules.length === 0) {
      errors.push('缺少互动模块');
    }
    
    if (!interactiveDesign.title || interactiveDesign.title.trim().length === 0) {
      errors.push('缺少标题');
    }
    
    if (!interactiveDesign.concepts || interactiveDesign.concepts.length === 0) {
      errors.push('缺少学习概念');
    }
    
    return errors;
  }
}

module.exports = OutputRenderer;