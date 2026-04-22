/**
 * 关键概念提取器
 *
 * 识别文本中的关键实体和关系。
 * 识别学习材料中的核心概念、术语、定义和它们之间的关系。
 * 支持中英文内容模式匹配。
 */

class ConceptExtractor {
  /**
   * 从处理后的内容中提取关键概念
   * @param {Object} processedContent - 处理后的内容结构
   * @returns {Promise<Array>} 概念数组
   */
  static async extract(processedContent) {
    console.log('提取关键概念');

    const text = processedContent.cleanedText || processedContent.extractedText || '';

    // 简化版概念提取
    const concepts = this.simpleExtractConcepts(text);

    // 确保每个概念都有有效的term（防止undefined）
    concepts.forEach(concept => {
      if (!concept.term || concept.term === 'undefined' || concept.term === 'null') {
        concept.term = concept.definition ? concept.definition.substring(0, 30) : '核心概念';
      }
    });

    return concepts;
  }

  /**
   * 简化版概念提取（支持中英文）
   */
  static simpleExtractConcepts(text) {
    const concepts = [];

    // 检测内容语言（简单判断）
    const hasChinese = /[\u4e00-\u9fff]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);

    const lines = text.split('\n');

    lines.forEach((line, index) => {
      // 中文定义模式
      if (hasChinese) {
        const definitionPatterns = [
          /([^，。；]+)是([^，。；]+)/g,
          /([^，。；]+)定义为([^，。；]+)/g,
          /([^，。；]+)指([^，。；]+)/g,
          /([^，。；]+)称为([^，。；]+)/g
        ];

        definitionPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            const concept = match[1].trim();
            const definition = match[2].trim();

            if (concept && definition && concept.length > 1 && definition.length > 1) {
              concepts.push({
                id: `concept_${concepts.length + 1}`,
                term: concept,
                definition: definition,
                type: 'definition',
                sourceLine: index,
                confidence: 0.7
              });
            }
          }
        });
      }

      // 英文定义模式
      if (hasEnglish) {
        const englishPatterns = [
          /([A-Z][a-zA-Z\s]+)\s+is\s+([^.!?]+[.!?]?)/gi,
          /([A-Z][a-zA-Z\s]+)\s+is\s+defined\s+as\s+([^.!?]+)/gi,
          /([A-Z][a-zA-Z\s]+)\s+refers\s+to\s+([^.!?]+)/gi
        ];

        englishPatterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(line)) !== null) {
            const term = match[1].trim();
            const definition = match[2].trim();

            // 过滤过于通用或简短的匹配
            if (term && definition && term.length > 2 && definition.length > 3) {
              // 排除以this/that/the开头的定义
              if (!/^(this|that|the|an?|it|they|we)\s/i.test(definition)) {
                concepts.push({
                  id: `concept_${concepts.length + 1}`,
                  term: term,
                  definition: definition,
                  type: 'definition',
                  sourceLine: index,
                  confidence: 0.7
                });
              }
            }
          }
        });

        // 英文技术术语（布尔代数相关）
        const knownTerms = /\b(AND|OR|NOT|NAND|NOR|XOR|BUFFER|FLIP-FLOP|LATCH|BOOLEAN|VARIABLE|EXPRESSION|TERM|MINTERM|MAXTERM|TRUTH\s*TABLE|GATE|CIRCUIT)\b/gi;
        const termMatches = line.match(knownTerms);
        if (termMatches) {
          termMatches.forEach(term => {
            // 提取上下文作为定义
            const idx = line.toLowerCase().indexOf(term.toLowerCase());
            const start = Math.max(0, idx - 40);
            const end = Math.min(line.length, idx + term.length + 40);
            let context = line.substring(start, end).replace(/[.!?]/g, '').trim();

            // 避免重复添加
            if (!concepts.some(c => c.term.toUpperCase() === term.toUpperCase())) {
              concepts.push({
                id: `concept_${concepts.length + 1}`,
                term: term.toUpperCase(),
                definition: `布尔代数术语: ${context}`,
                type: 'technical-term',
                sourceLine: index,
                confidence: 0.8
              });
            }
          });
        }
      }

      // 术语模式：引号、加粗等
      const termPatterns = [
        /"([^"]+)"/g,
        /'([^']+)'/g,
        /【([^】]+)】/g,
        /《([^》]+)》/g
      ];

      termPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const term = match[1].trim();

          if (term && term.length > 1) {
            concepts.push({
              id: `concept_${concepts.length + 1}`,
              term: term,
              type: 'term',
              sourceLine: index,
              confidence: 0.6
            });
          }
        }
      });
    });

    // 去重
    const uniqueConcepts = [];
    const seenTerms = new Set();

    concepts.forEach(concept => {
      const normalizedTerm = concept.term.toLowerCase();
      if (!seenTerms.has(normalizedTerm)) {
        seenTerms.add(normalizedTerm);
        uniqueConcepts.push(concept);
      }
    });

    // 如果没有提取到概念，从内容关键词派生
    if (uniqueConcepts.length === 0 && text.length > 0) {
      // 尝试提取大写开头的短语（可能是标题或术语）
      const capitalizedPhrases = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g);
      if (capitalizedPhrases && capitalizedPhrases.length > 0) {
        capitalizedPhrases.slice(0, 5).forEach((phrase, idx) => {
          uniqueConcepts.push({
            id: `concept_${idx + 1}`,
            term: phrase,
            definition: '从文本内容提取的概念',
            type: 'extracted',
            confidence: 0.5
          });
        });
      }
    }

    // 最后保底
    if (uniqueConcepts.length === 0) {
      uniqueConcepts.push({
        id: 'concept_1',
        term: '核心概念',
        definition: '学习材料中的主要知识点',
        type: 'generic',
        confidence: 0.5
      });
    }

    return uniqueConcepts;
  }
}

module.exports = ConceptExtractor;