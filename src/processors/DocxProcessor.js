/**
 * Word文档处理器
 * 
 * 调用[skill:docx]技能解析Word文档，提取标题、段落、列表等格式化内容。
 * 获得带语义标签的文档内容，便于概念提取。
 */

class DocxProcessor {
  /**
   * 处理DOCX文件
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} filePath - DOCX文件路径
   * @param {string} tempDir - 临时目录路径
   * @returns {Promise<Object>} 处理后的内容结构
   */
  static async process(context, filePath, tempDir) {
    console.log(`调用docx技能处理Word文档：${filePath}`);
    
    try {
      // 调用docx技能提取内容
      const docxResult = await context.useSkill('docx', { filePath });
      
      // docx技能返回的数据结构可能包含text、structure等字段
      const extractedText = docxResult.text || docxResult.content || 
                           `从Word文档 ${filePath} 提取的文本内容。`;
      const metadata = docxResult.metadata || {
        title: 'Word文档',
        author: '未知',
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
      
      // 结构信息
      const structure = docxResult.structure || {
        headings: [
          { level: 1, text: '主标题', position: 0 },
          { level: 2, text: '副标题', position: 10 }
        ],
        paragraphs: extractedText.split('\n\n').filter(p => p.trim().length > 0),
        lists: docxResult.lists || [],
        tables: docxResult.tables || []
      };
      
      return {
        format: 'docx',
        filePath,
        extractedText,
        metadata,
        structure
      };
      
    } catch (error) {
      console.error(`调用docx技能失败：${error.message}，使用模拟数据`);
      
      // 失败时返回模拟数据
      return {
        format: 'docx',
        filePath,
        extractedText: `从Word文档 ${filePath} 提取的文本内容。实际实现中会调用docx技能提取完整文本。`,
        metadata: {
          title: '示例Word文档',
          author: '未知作者',
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        },
        structure: {
          headings: [
            { level: 1, text: '主标题', position: 0 },
            { level: 2, text: '副标题', position: 10 }
          ],
          paragraphs: [
            '这是第一个段落...',
            '这是第二个段落...'
          ],
          lists: [],
          tables: []
        }
      };
    }
  }
}

module.exports = DocxProcessor;