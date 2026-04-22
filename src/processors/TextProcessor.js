/**
 * 纯文本处理器
 * 
 * 处理TXT、MD、HTML等纯文本格式，以及用户直接输入的文本内容。
 * 提供基础文本清理、格式化和结构识别功能。
 */

const fs = require('fs-extra');
const path = require('path');

class TextProcessor {
  /**
   * 处理文本文件
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} filePath - 文本文件路径
   * @param {string} tempDir - 临时目录路径
   * @returns {Promise<Object>} 处理后的内容结构
   */
  static async process(context, filePath, tempDir) {
    console.log(`处理文本文件：${filePath}`);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return await this.processText(context, content, tempDir, filePath);
    } catch (error) {
      throw new Error(`读取文本文件失败：${error.message}`);
    }
  }
  
  /**
   * 处理直接文本输入
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} text - 文本内容
   * @param {string} tempDir - 临时目录路径
   * @param {string} source - 来源描述（可选）
   * @returns {Promise<Object>} 处理后的内容结构
   */
  static async processText(context, text, tempDir, source = 'direct_input') {
    console.log(`处理直接文本输入，长度：${text.length}字符`);
    
    // 基础文本清理和格式化
    const cleanedText = this.cleanText(text);
    
    // 尝试识别结构（如Markdown标题）
    const structure = this.analyzeStructure(cleanedText);
    
    return {
      format: 'text',
      source,
      originalText: text,
      cleanedText,
      structure,
      metadata: {
        length: text.length,
        lines: text.split('\n').length,
        processedAt: new Date().toISOString()
      }
    };
  }
  
  /**
   * 清理文本
   */
  static cleanText(text) {
    // 移除多余的空格和空行
    let cleaned = text.replace(/\r\n/g, '\n');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/[ \t]{2,}/g, ' ');
    
    // 标准化标点符号（可选）
    cleaned = cleaned.replace(/\.{3,}/g, '...');
    
    return cleaned.trim();
  }
  
  /**
   * 分析文本结构
   */
  static analyzeStructure(text) {
    const lines = text.split('\n');
    const structure = {
      headings: [],
      paragraphs: [],
      lists: [],
      codeBlocks: []
    };
    
    lines.forEach((line, index) => {
      // 检测Markdown标题
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        structure.headings.push({
          level: headingMatch[1].length,
          text: headingMatch[2].trim(),
          line: index
        });
      }
      
      // 检测列表项
      const listMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
      if (listMatch) {
        structure.lists.push({
          text: listMatch[1].trim(),
          line: index
        });
      }
      
      // 检测代码块（简化版）
      if (line.trim().startsWith('```')) {
        structure.codeBlocks.push({
          line: index
        });
      }
    });
    
    return structure;
  }
}

module.exports = TextProcessor;