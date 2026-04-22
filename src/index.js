/**
 * 渐进式互动学习生成器 - 主入口文件
 * 
 * 处理用户输入，协调文档处理、内容分析、互动生成、输出渲染和预览验证的完整工作流。
 * 遵循模块化管道架构：输入文档 → 内容提取 → 概念分析 → 互动设计 → 输出渲染 → 预览验证。
 */

const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const franc = require('franc');

// 导入各模块
const FileProcessor = require('./processors/FileProcessor');
const ContentAnalyzer = require('./analyzers/ContentAnalyzer');
const InteractiveDesigner = require('./generators/InteractiveDesigner');
const OutputRenderer = require('./outputs/OutputRenderer');
const PreviewManager = require('./preview/PreviewManager');

/**
 * 检测文本的主要语言
 * @param {string} text - 输入文本
 * @returns {string} 语言代码，例如 'en'（英语）、'zh'（中文）
 */
function detectLanguage(text) {
  if (!text || text.trim().length === 0) {
    return 'en'; // 默认英语
  }
  // 使用 franc 检测语言，只考虑前1000个字符以提升性能
  const sample = text.length > 1000 ? text.substring(0, 1000) : text;
  const langCode = franc.franc(sample, { minLength: 3 });
  // 将 franc 返回的代码映射为简化代码
  if (langCode.startsWith('zh')) {
    return 'zh';
  } else if (langCode.startsWith('en')) {
    return 'en';
  } else {
    // 其他语言默认为英语
    return 'en';
  }
}

/**
 * 主技能处理函数
 * @param {Object} context - WorkBuddy技能上下文
 * @param {Object} options - 用户选项
 * @param {string} options.input - 输入文件路径或文本内容
 * @param {string} options.inputType - 输入类型：'file' 或 'text'
 * @param {string} options.outputFormat - 输出格式：'twine', 'html', 'json'（默认：'html'）
 * @param {string} options.targetAudience - 目标受众：'student', 'self-learner', 'professional'（默认：'student'）
 * @param {boolean} options.generateVisuals - 是否生成可视化插图（默认：true）
 * @param {boolean} options.previewInBrowser - 是否在浏览器中预览（默认：true）
 * @returns {Promise<Object>} 处理结果
 */
async function generateInteractiveLearning(context, options = {}) {
  const sessionId = uuidv4();
  const tempDir = path.join('/tmp', `interactive-learning-${sessionId}`);
  
  try {
    // 1. 创建临时工作目录
    await fs.ensureDir(tempDir);
    console.log(`[${sessionId}] 临时工作目录：${tempDir}`);
    
    // 2. 处理输入内容
    console.log(`[${sessionId}] 步骤1：处理输入内容`);
    const processedContent = await FileProcessor.processInput(
      context,
      options.input, 
      options.inputType, 
      tempDir
    );
    
    // 3. 检测输入材料的主要语言
    console.log(`[${sessionId}] 步骤2：检测语言`);
    const textToDetect = processedContent.text || processedContent.rawText || JSON.stringify(processedContent);
    const detectedLang = detectLanguage(textToDetect);
    const languageCode = detectedLang === 'zh' ? 'zh-CN' : 'en-US';
    console.log(`[${sessionId}] 检测到语言：${detectedLang}（使用代码：${languageCode}）`);

    // 4. 分析学习内容
    console.log(`[${sessionId}] 步骤3：分析学习内容`);
    const analysisResult = await ContentAnalyzer.analyze(
      processedContent,
      {
        targetAudience: options.targetAudience || 'student',
        language: languageCode
      }
    );
    
    // 5. 设计互动学习体验
    console.log(`[${sessionId}] 步骤4：设计互动学习体验`);
    const interactiveDesign = await InteractiveDesigner.design(
      analysisResult,
      {
        applyPrinciples: ['progressive-disclosure', 'contextual-narrative', 'constructive-failure', 'problem-solving-opportunities'],
        generateVisuals: options.generateVisuals !== false,
        neutralInterface: true, // 使用中性化界面，避免游戏元素
        language: languageCode, // 传递检测到的语言代码
        tempDir: tempDir,
        context: context
      }
    );
    
    // 6. 渲染输出
    console.log(`[${sessionId}] 步骤5：渲染输出`);
    const outputFormat = options.outputFormat || 'html';
    const renderResult = await OutputRenderer.render(
      interactiveDesign,
      {
        format: outputFormat,
        language: languageCode, // 传递检测到的语言代码
        outputDir: tempDir
      }
    );
    
    // 7. 预览验证（如果启用）
    let previewUrl = null;
    if (options.previewInBrowser !== false && (outputFormat === 'html' || outputFormat === 'twine')) {
      console.log(`[${sessionId}] 步骤6：预览验证`);
      previewUrl = await PreviewManager.preview(renderResult.outputPath, tempDir, context);
    }
    
    // 7. 准备返回结果
    const result = {
      success: true,
      sessionId,
      design: interactiveDesign,
      output: {
        format: outputFormat,
        path: renderResult.outputPath,
        files: renderResult.generatedFiles
      },
      preview: previewUrl,
      tempDir: tempDir
    };
    
    console.log(`[${sessionId}] 处理完成，输出文件：${renderResult.outputPath}`);
    return result;
    
  } catch (error) {
    console.error(`[${sessionId}] 处理失败：`, error);
    
    // 清理临时目录（可选）
    try {
      await fs.remove(tempDir);
    } catch (cleanupError) {
      console.error(`[${sessionId}] 清理临时目录失败：`, cleanupError);
    }
    
    throw new Error(`互动学习生成失败：${error.message}`);
  }
}

/**
 * 技能主入口 - WorkBuddy技能标准接口
 * @param {Object} context - WorkBuddy技能上下文
 * @param {Object} params - 技能参数
 */
module.exports = async function main(context, params) {
  const { input, inputType = 'text', outputFormat = 'html', targetAudience = 'student' } = params;
  
  if (!input) {
    throw new Error('缺少输入内容。请提供文件路径或文本内容。');
  }
  
  try {
    const result = await generateInteractiveLearning(context, {
      input,
      inputType,
      outputFormat,
      targetAudience,
      generateVisuals: true,
      previewInBrowser: true
    });
    
    // 构建用户友好的输出消息
    const outputMessage = buildOutputMessage(result, params);
    
    return {
      success: true,
      message: outputMessage,
      data: result
    };
    
  } catch (error) {
    return {
      success: false,
      message: `生成互动学习内容时出错：${error.message}`,
      error: error.message
    };
  }
};

/**
 * 构建用户友好的输出消息
 */
function buildOutputMessage(result, params) {
  const { outputFormat } = params;
  const { output, preview } = result;
  
  let message = `✅ 互动学习内容生成成功！\n\n`;
  message += `**输出格式**：${outputFormat.toUpperCase()}\n`;
  message += `**输出文件**：${output.path}\n`;
  message += `**生成文件数**：${output.files.length}个\n\n`;
  
  if (preview) {
    message += `**预览地址**：${preview}\n`;
    message += `已自动在浏览器中打开预览。\n\n`;
  }
  
  message += `**设计概览**：\n`;
  message += `- 学习概念：${result.design.concepts.length}个\n`;
  message += `- 互动模块：${result.design.interactiveModules.length}个\n`;
  message += `- 应用原则：${result.design.designPrinciplesApplied.join('、')}\n\n`;
  
  message += `**下一步操作**：\n`;
  if (outputFormat === 'twine') {
    message += `1. 将输出文件导入Twine编辑器进行进一步编辑\n`;
    message += `2. 在Twine中调整分支逻辑和叙事流程\n`;
    message += `3. 导出为HTML或发布到Web\n`;
  } else if (outputFormat === 'html') {
    message += `1. 在浏览器中打开HTML文件进行测试\n`;
    message += `2. 分享给学习者使用\n`;
    message += `3. 如需编辑，可修改生成的HTML文件或重新生成\n`;
  } else if (outputFormat === 'json') {
    message += `1. 使用JSON数据集成到其他学习平台\n`;
    message += `2. 基于数据结构开发自定义前端\n`;
    message += `3. 进行数据分析或个性化推荐\n`;
  }
  
  return message;
}

// 导出函数供测试使用
module.exports.generateInteractiveLearning = generateInteractiveLearning;
module.exports.buildOutputMessage = buildOutputMessage;