/**
 * 图表生成器
 * 
 * 调用minimax-image-generator技能生成学习概念的可视化图表。
 * 根据学习内容和设计原则，自动生成概念图、流程图、示意图等可视化元素。
 */

const fs = require('fs-extra');
const path = require('path');

class DiagramGenerator {
  /**
   * 生成概念图
   * @param {Object} concept - 学习概念对象
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} outputDir - 输出目录
   * @returns {Promise<string>} 生成的图像文件路径
   */
  static async generateConceptDiagram(concept, context, outputDir) {
    const { name, description, relationships = [] } = concept;

    // 构建提示词
    const prompt = this.buildConceptDiagramPrompt(name, description, relationships);

    console.log(`生成概念图 "${name}"，提示词：${prompt.substring(0, 100)}...`);

    try {
      // 检查context.useSkill是否存在
      if (typeof context?.useSkill !== 'function') {
        console.warn('context.useSkill不可用，跳过图像生成');
        return null;
      }

      // 调用minimax-image-generator技能
      const imageResult = await context.useSkill('minimax-image-generator', {
        prompt,
        size: '1024x1024',
        quality: 'high',
        style: 'vivid',
        n: 1
      });
      
      // 保存图像文件
      const fileName = `concept-${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now()}.png`;
      const filePath = path.join(outputDir, fileName);
      
      // imageResult可能包含base64数据或文件路径
      if (imageResult.base64) {
        const buffer = Buffer.from(imageResult.base64, 'base64');
        await fs.writeFile(filePath, buffer);
      } else if (imageResult.path) {
        await fs.copy(imageResult.path, filePath);
      } else {
        throw new Error('图像生成结果格式未知');
      }
      
      console.log(`概念图已保存：${filePath}`);
      return filePath;
      
    } catch (error) {
      console.error(`概念图生成失败：${error.message}`);
      return null;
    }
  }
  
  /**
   * 生成流程图
   * @param {Array} steps - 学习步骤数组
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} outputDir - 输出目录
   * @returns {Promise<string>} 生成的图像文件路径
   */
  static async generateFlowchart(steps, context, outputDir) {
    // 检查context.useSkill是否存在
    if (typeof context?.useSkill !== 'function') {
      console.warn('context.useSkill不可用，跳过流程图生成');
      return null;
    }

    // 构建流程图提示词
    const stepDescriptions = steps.map((step, idx) =>
      `${idx + 1}. ${step.title}: ${step.description}`
    ).join('\n');

    const prompt = `创建一个专业的学习流程图，包含以下步骤：
${stepDescriptions}

要求：
1. 使用中性、专业的配色方案（蓝、灰、白为主）
2. 每个步骤用清晰的方框表示
3. 箭头指示学习流程方向
4. 避免游戏化元素，保持教育专业风格
5. 中文标签`;

    console.log(`生成流程图，共 ${steps.length} 个步骤`);

    try {
      const imageResult = await context.useSkill('minimax-image-generator', {
        prompt,
        size: '1536x1024',
        quality: 'high',
        style: 'natural',
        n: 1
      });
      
      const fileName = `flowchart-${Date.now()}.png`;
      const filePath = path.join(outputDir, fileName);
      
      if (imageResult.base64) {
        const buffer = Buffer.from(imageResult.base64, 'base64');
        await fs.writeFile(filePath, buffer);
      } else if (imageResult.path) {
        await fs.copy(imageResult.path, filePath);
      } else {
        throw new Error('图像生成结果格式未知');
      }
      
      console.log(`流程图已保存：${filePath}`);
      return filePath;
      
    } catch (error) {
      console.error(`流程图生成失败：${error.message}`);
      return null;
    }
  }
  
  /**
   * 生成示意图
   * @param {string} conceptName - 概念名称
   * @param {string} explanation - 概念解释
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} outputDir - 输出目录
   * @returns {Promise<string>} 生成的图像文件路径
   */
  static async generateIllustration(conceptName, explanation, context, outputDir) {
    // 检查context.useSkill是否存在
    if (typeof context?.useSkill !== 'function') {
      console.warn('context.useSkill不可用，跳过示意图生成');
      return null;
    }

    const prompt = `创建一个教育示意图，解释概念："${conceptName}"

概念解释：${explanation}

要求：
1. 使用中性、专业的视觉风格
2. 清晰展示概念的核心要素
3. 避免卡通或游戏化元素
4. 适合学术和学习场景
5. 中文标签`;

    console.log(`生成示意图 "${conceptName}"`);
    
    try {
      const imageResult = await context.useSkill('minimax-image-generator', {
        prompt,
        size: '1024x1024',
        quality: 'high',
        style: 'natural',
        n: 1
      });
      
      const fileName = `illustration-${conceptName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now()}.png`;
      const filePath = path.join(outputDir, fileName);
      
      if (imageResult.base64) {
        const buffer = Buffer.from(imageResult.base64, 'base64');
        await fs.writeFile(filePath, buffer);
      } else if (imageResult.path) {
        await fs.copy(imageResult.path, filePath);
      } else {
        throw new Error('图像生成结果格式未知');
      }
      
      console.log(`示意图已保存：${filePath}`);
      return filePath;
      
    } catch (error) {
      console.error(`示意图生成失败：${error.message}`);
      return null;
    }
  }
  
  /**
   * 构建概念图提示词
   */
  static buildConceptDiagramPrompt(name, description, relationships) {
    // Handle undefined name
    const safeName = name || '核心概念';
    const safeDesc = description || '关键学习概念';
    const relText = (relationships && relationships.length > 0)
      ? `相关概念：${relationships.map(r => r.target).join('、')}`
      : '';

    return `创建一个专业的学习概念图，展示概念："${safeName}"

概念描述：${description}
${relText}

要求：
1. 中心位置放置主概念"${name}"
2. 相关概念围绕中心，用连线表示关系
3. 使用中性、专业的配色（蓝、灰、绿为主）
4. 避免游戏化或卡通风格
5. 适合学术和学习场景
6. 中文标签
7. 整体布局清晰，信息层次分明`;
  }
  
  /**
   * 批量生成可视化内容
   * @param {Array} concepts - 概念数组
   * @param {Object} design - 互动设计
   * @param {Object} context - WorkBuddy技能上下文
   * @param {string} outputDir - 输出目录
   * @returns {Promise<Object>} 生成结果
   */
  static async generateAllVisuals(concepts, design, context, outputDir) {
    console.log(`开始批量生成可视化内容，共 ${concepts.length} 个概念`);
    
    const results = {
      conceptDiagrams: [],
      flowcharts: [],
      illustrations: []
    };
    
    // 生成概念图
    for (const concept of concepts) {
      const diagramPath = await this.generateConceptDiagram(concept, context, outputDir);
      if (diagramPath) {
        results.conceptDiagrams.push({
          concept: concept.term || concept.name || '未知概念',
          path: diagramPath
        });
      }
    }
    
    // 如果有学习步骤，生成流程图
    if (design.learningSteps && design.learningSteps.length > 0) {
      const flowchartPath = await this.generateFlowchart(design.learningSteps, context, outputDir);
      if (flowchartPath) {
        results.flowcharts.push({
          path: flowchartPath
        });
      }
    }
    
    // 为关键概念生成示意图
    const keyConcepts = concepts.filter(c => c.importance === 'high').slice(0, 3);
    for (const concept of keyConcepts) {
      const illustrationPath = await this.generateIllustration(
        concept.name, 
        concept.description,
        context,
        outputDir
      );
      if (illustrationPath) {
        results.illustrations.push({
          concept: concept.term || concept.name || '未知概念',
          path: illustrationPath
        });
      }
    }
    
    console.log(`可视化内容生成完成：
    - 概念图：${results.conceptDiagrams.length}个
    - 流程图：${results.flowcharts.length}个
    - 示意图：${results.illustrations.length}个`);
    
    return results;
  }
}

module.exports = DiagramGenerator;