/**
 * 文件处理器 - 协调不同格式的输入处理
 * 
 * 根据输入类型调用相应的处理器：
 * - PDF: 调用pdf技能
 * - DOCX: 调用docx技能  
 * - PPTX: 调用pptx技能
 * - 文本: 直接处理
 * - 图片: 调用多模态技能
 */

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');

// 导入各专用处理器
const PdfProcessor = require('./PdfProcessor');
const DocxProcessor = require('./DocxProcessor');
const PptxProcessor = require('./PptxProcessor');
const TextProcessor = require('./TextProcessor');
const ImageProcessor = require('./ImageProcessor');

class FileProcessor {
  /**
   * 处理输入内容
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} input - 输入文件路径或文本内容
   * @param {string} inputType - 'file' 或 'text'
   * @param {string} tempDir - 临时目录路径
   * @returns {Promise<Object>} 处理后的内容结构
   */
  static async processInput(context, input, inputType, tempDir) {
    if (inputType === 'file') {
      return await this.processFile(context, input, tempDir);
    } else {
      return await this.processText(context, input, tempDir);
    }
  }
  
  /**
   * 处理文件输入
   */
  static async processFile(context, filePath, tempDir) {
    // 验证文件存在
    if (!await fs.pathExists(filePath)) {
      throw new Error(`文件不存在：${filePath}`);
    }
    
    // 获取文件扩展名和MIME类型
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mime.lookup(filePath) || '';
    
    console.log(`处理文件：${filePath}，扩展名：${ext}，MIME类型：${mimeType}`);
    
    // 根据文件类型分发给相应处理器
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      return await PdfProcessor.process(context, filePath, tempDir);
    } else if (ext === '.docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await DocxProcessor.process(context, filePath, tempDir);
    } else if (ext === '.pptx' || mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      return await PptxProcessor.process(context, filePath, tempDir);
    } else if (['.txt', '.md', '.html', '.htm'].includes(ext)) {
      return await TextProcessor.process(context, filePath, tempDir);
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(ext) || mimeType.startsWith('image/')) {
      return await ImageProcessor.process(context, filePath, tempDir);
    } else {
      // 默认尝试作为文本处理
      console.log(`未知文件类型 ${ext}，尝试作为文本处理`);
      return await TextProcessor.process(context, filePath, tempDir);
    }
  }
  
  /**
   * 处理文本输入
   */
  static async processText(context, text, tempDir) {
    return await TextProcessor.processText(context, text, tempDir);
  }
  
  /**
   * 检测输入类型
   */
  static async detectInputType(input) {
    // 检查是否为文件路径
    if (await fs.pathExists(input)) {
      return 'file';
    }
    
    // 检查是否为URL（简单检测）
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return 'url';
    }
    
    // 默认为文本
    return 'text';
  }
}

module.exports = FileProcessor;