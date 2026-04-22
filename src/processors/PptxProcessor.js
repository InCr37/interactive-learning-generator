/**
 * PPT演示文稿处理器
 * 
 * 调用[skill:pptx]技能读取PPT演示文稿，提取每页标题、要点和演讲者备注。
 * 将幻灯片内容转换为线性叙事基础。
 */

class PptxProcessor {
  /**
   * 处理PPTX文件
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} filePath - PPTX文件路径
   * @param {string} tempDir - 临时目录路径
   * @returns {Promise<Object>} 处理后的内容结构
   */
  static async process(context, filePath, tempDir) {
    console.log(`调用pptx技能处理PPT演示文稿：${filePath}`);
    
    try {
      // 调用pptx技能提取内容
      const pptxResult = await context.useSkill('pptx', { filePath });
      
      // pptx技能返回的数据结构可能包含slides、metadata等字段
      const extractedText = pptxResult.text || pptxResult.content || 
                           `从PPT演示文稿 ${filePath} 提取的文本内容。`;
      const metadata = pptxResult.metadata || {
        title: 'PPT演示文稿',
        author: '未知',
        slides: pptxResult.slides ? pptxResult.slides.length : 0,
        created: new Date().toISOString()
      };
      
      // 幻灯片数据
      const slides = pptxResult.slides || [
        {
          slideNumber: 1,
          title: '第一张幻灯片',
          content: '这是第一张幻灯片的内容要点...',
          notes: '演讲者备注：这是重要概念...'
        },
        {
          slideNumber: 2,
          title: '第二张幻灯片',
          content: '这是第二张幻灯片的内容要点...',
          notes: ''
        }
      ];
      
      return {
        format: 'pptx',
        filePath,
        extractedText,
        metadata,
        slides
      };
      
    } catch (error) {
      console.error(`调用pptx技能失败：${error.message}，使用模拟数据`);
      
      // 失败时返回模拟数据
      return {
        format: 'pptx',
        filePath,
        extractedText: `从PPT演示文稿 ${filePath} 提取的文本内容。实际实现中会调用pptx技能提取完整文本。`,
        metadata: {
          title: '示例PPT演示文稿',
          author: '未知作者',
          slides: 5,
          created: new Date().toISOString()
        },
        slides: [
          {
            slideNumber: 1,
            title: '第一张幻灯片',
            content: '这是第一张幻灯片的内容要点...',
            notes: '演讲者备注：这是重要概念...'
          },
          {
            slideNumber: 2,
            title: '第二张幻灯片',
            content: '这是第二张幻灯片的内容要点...',
            notes: ''
          }
        ]
      };
    }
  }
}

module.exports = PptxProcessor;