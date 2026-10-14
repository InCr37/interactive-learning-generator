/**
 * CheatSheetGenerator
 *
 * Automatically generates markdown summary/cheat sheet from interactive learning content.
 * Creates a quick reference handbook that learners can use for review.
 */

class CheatSheetGenerator {
  /**
   * Generate a cheat sheet from the interactive design
   * @param {Object} design - The interactive learning design
   * @param {Object} options - Generation options
   * @returns {Object} Generated cheat sheet content and metadata
   */
  static generate(design, options = {}) {
    const {
      title = design.title || 'Summary',
      includeFormulas = true,
      includeKeyConcepts = true,
      includeExamples = true,
      format = 'markdown'
    } = options;

    const modules = design.interactiveModules || [];
    const concepts = design.concepts || [];
    const learningObjectives = design.learningObjectives || [];

    // Extract teaching modules for formulas
    const teachingModules = modules.filter(m =>
      m.type === 'teaching' || m.type === 'conceptual' || m.type === 'progressive-code'
    );

    // Extract quiz modules for key questions
    const quizModules = modules.filter(m =>
      m.type === 'quiz' || m.quiz
    );

    // Build sections
    const sections = [];

    // 1. Title and Overview
    sections.push(this.generateTitleSection(design, learningObjectives));

    // 2. Key Concepts (extracted from teaching content)
    if (includeKeyConcepts) {
      sections.push(this.generateConceptsSection(teachingModules, concepts));
    }

    // 3. Formulas (extracted from teaching content)
    if (includeFormulas) {
      sections.push(this.generateFormulasSection(teachingModules));
    }

    // 4. Key Questions (for self-testing)
    if (includeExamples && quizModules.length > 0) {
      sections.push(this.generateQuestionsSection(quizModules));
    }

    // 5. Common Problems and Solutions
    sections.push(this.generateProblemsSection(teachingModules));

    return {
      title,
      sections,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceMaterial: design.metadata?.sourceMaterial || 'Interactive Learning Module',
        moduleCount: modules.length,
        conceptCount: concepts.length,
        quizCount: quizModules.length
      }
    };
  }

  /**
   * Generate title and learning objectives section
   */
  static generateTitleSection(design, learningObjectives) {
    let content = `# ${design.title || 'Quick Reference'}\n\n`;
    if (design.description) {
      content += `${design.description}\n\n`;
    }
    if (learningObjectives.length > 0) {
      content += `## Learning Objectives\n\n`;
      learningObjectives.forEach((obj, i) => {
        const text = typeof obj === 'string' ? obj : obj.text || obj.title || '';
        content += `${i + 1}. ${text}\n`;
      });
      content += '\n';
    }

    return { type: 'title', content };
  }

  /**
   * Extract and organize key concepts
   */
  static generateConceptsSection(teachingModules, concepts) {
    let content = `## Key Concepts\n\n`;
    const conceptMap = new Map();

    for (const concept of concepts) {
      const term = concept.term || concept.id || '';
      const definition = concept.definition || concept.description || '';
      if (term && definition) {
        conceptMap.set(term, definition);
      }
    }

    for (const module of teachingModules) {
      if (module.content) {
        const text = module.content.explanation || module.content.analogy || module.content.description || '';
        const concept = module.concept || module.title || '';
        if (concept && text && !conceptMap.has(concept)) {
          conceptMap.set(concept, text);
        }
      }
    }

    for (const [term, def] of conceptMap) {
      content += `### ${term}\n\n${def}\n\n`;
    }

    return { type: 'concepts', content };
  }

  /**
   * Extract formulas from teaching content
   */
  static generateFormulasSection(teachingModules) {
    let content = `## Key Formulas\n\n`;
    const formulaKeywords = [
      'c =', 'E =', 'B =', 'F =', 'U =', 'ω =', 'λ =', 'k =', 'τ =',
      'Φ =', 'L =', 'R =', 'C =', 'I =', 'V =', 'P =',
      'dΦ/dt', 'di/dt', 'dq/dt', 'dU/dt',
      '∮E·dl', '∮B·dl', '∫E·dA', '∫B·dA',
      '∇×', '∇·', '∂/∂t', '√(ε₀μ₀)', '1/√',
      'dsinθ', 'dy_m/R', '2t =', 'mλ'
    ];
    const foundFormulas = new Set();

    for (const module of teachingModules) {
      let text = '';
      if (module.content) {
        text += module.content.explanation || '';
      }

      for (const keyword of formulaKeywords) {
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped + '[^,\n]*');
        const match = text.match(regex);
        if (match) {
          foundFormulas.add(match[0].trim());
        }
      }
    }

    if (foundFormulas.size > 0) {
      for (const formula of foundFormulas) {
        if (formula.length < 100) {
          content += `- \`${formula}\`\n`;
        }
      }
    } else {
      content += `_Formulas are highlighted in the interactive lessons._\n`;
    }

    content += '\n';
    return { type: 'formulas', content };
  }

  /**
   * Generate key questions for self-testing
   */
  static generateQuestionsSection(quizModules) {
    let content = `## Self-Test Questions\n\n`;
    let qNum = 1;

    for (const quiz of quizModules.slice(0, 10)) {
      const question = quiz.question || quiz.quiz?.questionStem || quiz.title || '';
      if (question) {
        content += `${qNum}. ${question}\n`;
        if (quiz.options) {
          content += `   _(${quiz.options.length} options)_\n`;
        }
        content += '\n';
        qNum++;
      }
    }

    return { type: 'questions', content };
  }

  /**
   * Generate common problems and solutions section
   */
  static generateProblemsSection(teachingModules) {
    let content = `## Quick Problem-Solving Guide\n\n`;

    for (const module of teachingModules) {
      const title = module.title || module.concept || '';
      if (module.steps && module.steps.length > 0) {
        content += `### ${title}\n\n`;
        for (const step of module.steps) {
          const explanation = step.explanation || '';
          if (explanation) {
            content += `- ${explanation.substring(0, 100)}...\n`;
          }
        }
        content += '\n';
      }

      if (module.content?.keyPoints) {
        content += `### ${title}\n\n`;
        for (const point of module.content.keyPoints) {
          content += `- ${point}\n`;
        }
        content += '\n';
      }
    }

    return { type: 'problems', content };
  }

  /**
   * Format the complete cheat sheet as markdown
   */
  static toMarkdown(cheatSheet) {
    let output = '';
    output += `# ${cheatSheet.title}\n\n`;
    output += `_Generated: ${new Date(cheatSheet.metadata.generatedAt).toLocaleDateString()}_\n\n`;
    output += `---\n\n`;

    for (const section of cheatSheet.sections) {
      output += section.content;
      output += `---\n\n`;
    }

    output += `## Tips for Success\n\n`;
    output += `- Review the key concepts before attempting problems\n`;
    output += `- Practice with the self-test questions\n`;
    output += `- Focus on understanding the formulas, not just memorizing\n`;
    output += `- Make connections between related concepts\n\n`;

    return output;
  }

  /**
   * Save cheat sheet to file
   */
  static async save(cheatSheet, outputPath) {
    const fs = require('fs-extra');
    const markdown = this.toMarkdown(cheatSheet);
    await fs.writeFile(outputPath, markdown, 'utf8');
    return { path: outputPath, length: markdown.length };
  }

  /**
   * Generate and save in one step
   */
  static async generateAndSave(design, options = {}) {
    const { outputDir = './', baseName = 'cheat_sheet' } = options;
    const cheatSheet = this.generate(design, options);

    const path = require('path');
    let outputPath;

    if (options.inputPath) {
      // Sanitize inputPath to prevent ENAMETOOLONG errors
      let baseNameFromInput = path.parse(options.inputPath).name;
      // If name is too long or empty/unusual, use a hash or fallback
      if (!baseNameFromInput || baseNameFromInput.length > 100 || baseNameFromInput.length < 2) {
        // Create a safe filename from the first few words
        const safeName = options.inputPath.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
        baseNameFromInput = safeName || 'summary';
      }
      outputPath = path.join(outputDir, `${baseNameFromInput}_summary.md`);
    } else {
      outputPath = path.join(outputDir, `${baseName}_summary.md`);
    }

    await this.save(cheatSheet, outputPath);

    return {
      cheatSheet,
      outputPath,
      markdown: this.toMarkdown(cheatSheet)
    };
  }
}

module.exports = CheatSheetGenerator;