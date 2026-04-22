/**
 * SpiralPracticeGenerator - Progressive Integration / Spiral Curriculum Generator
 *
 * Generates cumulative practice problems that:
 * 1. Start with single-concept practice
 * 2. Gradually integrate previously learned concepts
 * 3. Build to comprehensive final challenges
 *
 * This implements the "Spiral Curriculum" approach where each problem
 * reinforces old concepts while introducing new ones.
 */

class SpiralPracticeGenerator {
  /**
   * Generate spiral practice flow
   * @param {Array} concepts - All concepts to learn
   * @param {Array} teachingModules - The teaching modules that were generated
   * @param {Object} options - Generation options
   * @returns {Object} Spiral practice structure with progressive problems
   */
  static generate(concepts, teachingModules, options = {}) {
    const {
      integrationPoint = 2,  // After how many concepts to start combining
      problemsPerLevel = 1,   // Problems at each integration level
      includeFinalChallenge = true
    } = options;

    const spiralPractice = {
      type: 'spiral',
      description: 'Cumulative practice with progressive integration',

      // Track which concepts have been introduced
      conceptProgression: concepts.map((c, i) => ({
        index: i,
        concept: c.term,
        introducedAt: i + 1, // Teaching sequence number
        practiceLevels: []
      })),

      practiceLevels: [],

      finalChallenge: null
    };

    // Generate practice levels
    // Level 1: Single-concept practice (concepts 1, 2, 3... individually)
    // Level 2: 2-concept combinations (concepts 1+2, 2+3, 3+4...)
    // Level 3: 3-concept combinations, etc.
    // Final: All concepts combined

    for (let level = 1; level <= concepts.length; level++) {
      const problemsAtLevel = this.generateProblemsForLevel(
        concepts,
        level,
        teachingModules,
        problemsPerLevel
      );

      spiralPractice.practiceLevels.push({
        level,
        conceptCount: level,
        description: this.getLevelDescription(level, concepts.length),
        problems: problemsAtLevel
      });
    }

    // Generate final comprehensive challenge
    if (includeFinalChallenge) {
      spiralPractice.finalChallenge = this.generateFinalChallenge(
        concepts,
        teachingModules
      );
    }

    return spiralPractice;
  }

  /**
   * Generate problems for a specific level
   * Level 1 = single concept, Level 2 = 2 concepts, etc.
   */
  static generateProblemsForLevel(concepts, level, teachingModules, problemsPerLevel) {
    const problems = [];

    if (level === 1) {
      // Level 1: Practice each concept individually
      for (let i = 0; i < concepts.length; i++) {
        const problem = this.generateSingleConceptProblem(
          concepts[i],
          teachingModules[i],
          i
        );
        problems.push(problem);
      }
    } else {
      // Level 2+: Practice combinations of 'level' consecutive concepts
      for (let startIdx = 0; startIdx <= concepts.length - level; startIdx++) {
        const conceptGroup = concepts.slice(startIdx, startIdx + level);
        const teachingGroup = teachingModules.slice(startIdx, startIdx + level);

        const problem = this.generateCombinedProblem(
          conceptGroup,
          teachingGroup,
          startIdx,
          level
        );
        problems.push(problem);
      }
    }

    return problems;
  }

  /**
   * Generate single-concept practice problem
   */
  static generateSingleConceptProblem(concept, teachingModule, index) {
    const isProgramming = this.isProgrammingConcept(concept);

    return {
      id: `spiral_l1_p${index + 1}`,
      level: 1,
      title: `Practice: ${concept.term}`,
      conceptsCovered: [concept.term],

      scenario: this.generateScenario(concept),

      problem: isProgramming
        ? this.generateCodeProblem(concept)
        : this.generateConceptualProblem(concept),

      hints: this.generateHints(concept, 1),

      feedback: {
        correct: `Excellent! You've mastered "${concept.term}".`,
        incorrect: `Not quite. Remember: ${this.getConceptReminder(concept)}`
      },

      nextConceptsHint: index < 3 ? `Next, we'll learn about another concept.` : null
    };
  }

  /**
   * Generate combined problem covering multiple concepts
   */
  static generateCombinedProblem(concepts, teachingModules, startIndex, level) {
    const isProgramming = concepts.some(c => this.isProgrammingConcept(c));

    return {
      id: `spiral_l${level}_p${startIndex + 1}`,
      level,
      title: `Practice: ${concepts.map(c => c.term).join(' + ')}`,
      conceptsCovered: concepts.map(c => c.term),

      scenario: this.generateCombinedScenario(concepts),

      problem: isProgramming
        ? this.generateCombinedCodeProblem(concepts)
        : this.generateCombinedConceptualProblem(concepts),

      hints: this.generateHints(concepts, level),

      feedback: {
        correct: `Great job! You're integrating ${concepts.map(c => `"${c.term}"`).join(' and ')} together.`,
        incorrect: `Think about each concept separately first: ${concepts.map(c => `${c.term} means ${this.getBriefExplanation(c)}`).join('; ')}`
      },

      connectionsExplained: this.explainConceptConnections(concepts)
    };
  }

  /**
   * Generate final comprehensive challenge covering ALL concepts
   */
  static generateFinalChallenge(concepts, teachingModules) {
    const isProgramming = concepts.some(c => this.isProgrammingConcept(c));

    return {
      id: 'spiral_final',
      level: concepts.length,
      title: 'Final Challenge: Put It All Together',

      scenario: this.generateFinalScenario(concepts),

      problem: isProgramming
        ? this.generateFinalCodeProblem(concepts)
        : this.generateFinalConceptualProblem(concepts),

      subtasks: concepts.map((concept, i) => ({
        concept: concept.term,
        description: `Correctly implement ${concept.term}`
      })),

      hints: this.generateHints(concepts, concepts.length),

      maxAttempts: 3,

      feedback: {
        perfect: `Perfect! You've mastered all ${concepts.length} concepts and can use them together!`,
        partial: `Good progress! Review the concepts you missed and try again.`,
        needsReview: `Keep practicing! Go back and review the teaching modules for concepts you struggled with.`
      },

      solutionApproach: this.getSolutionApproach(concepts),

      reward: {
        type: 'completion',
        message: `Congratulations! You have completed the ${concepts.length}-concept learning module!`
      }
    };
  }

  // ========== Helper Methods ==========

  /**
   * Check if a concept is programming-related
   */
  static isProgrammingConcept(concept) {
    const term = (concept.term || '').toLowerCase();
    const def = (concept.definition || '').toLowerCase();
    const text = term + ' ' + def;

    const keywords = [
      'if', 'else', 'for', 'while', 'loop', 'function', 'variable',
      'arduino', 'code', 'programming', 'digital', 'analog', 'pin',
      'operator', 'boolean', 'statement', 'syntax', 'algorithm'
    ];

    return keywords.some(kw => text.includes(kw));
  }

  /**
   * Generate scenario for single concept practice
   */
  static generateScenario(concept) {
    const term = concept.term.toLowerCase();

    if (term.includes('if') || term.includes('condition')) {
      return `Your robot detects the temperature is ${this.randomTemp()}°C. It needs to decide whether to turn on cooling.`;
    }
    if (term.includes('for') || term.includes('loop')) {
      return `Your robot needs to flash its LED exactly ${this.randomNum(3, 6)} times before moving.`;
    }
    if (term.includes('while')) {
      return `Your robot should keep moving forward until it detects an obstacle.`;
    }
    if (term.includes('compar') || term.includes('operator')) {
      return `Your robot has two sensor readings. It needs to compare them to make a decision.`;
    }

    return `Apply the concept of "${concept.term}" to solve this problem.`;
  }

  /**
   * Generate scenario for combined practice
   */
  static generateCombinedScenario(concepts) {
    const terms = concepts.map(c => c.term.toLowerCase());

    // Arduino robot scenario that uses multiple concepts
    const scenarios = [
      `Your robot needs to navigate a course using multiple sensors and make decisions based on conditions.`,

      `A temperature monitoring system needs to respond differently based on various thresholds and keep running until stable.`,

      `An automated lighting system should respond to light levels, run for a specific number of cycles, and handle errors.`,

      `Your robot must patrol an area, responding to obstacles while tracking how many times it's moved.`
    ];

    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }

  /**
   * Generate final scenario
   */
  static generateFinalScenario(concepts) {
    return `Final Mission: Design a complete Arduino control system that demonstrates mastery of all ${concepts.length} concepts:\n\n` +
           concepts.map((c, i) => `${i + 1}. ${c.term}`).join('\n') +
           `\n\nYour solution should correctly use ALL concepts together in a coherent program.`;
  }

  /**
   * Generate programming problem for single concept
   */
  static generateCodeProblem(concept) {
    const term = concept.term.toLowerCase();

    if (term.includes('if')) {
      return {
        type: 'code',
        instruction: 'Write the condition:',
        template: `int temperature = ${this.randomTemp()};\n\nif (___) {\n  fanOn();\n}\nelse {\n  fanOff();\n}`,
        question: 'Complete the if condition to turn on fan when temperature exceeds 30°C:',
        expectedAnswer: 'temperature > 30',
        validation: 'condition_correct'
      };
    }

    if (term.includes('for') || term.includes('loop')) {
      return {
        type: 'code',
        instruction: 'Write the for loop header:',
        template: `___ (int i = 0; i < ${this.randomNum(3, 6)}; i++) {\n  flashLED();\n}`,
        question: `Complete the for loop to repeat ${this.randomNum(3, 6)} times:`,
        expectedAnswer: 'for',
        validation: 'keyword_present'
      };
    }

    if (term.includes('while')) {
      return {
        type: 'code',
        instruction: 'Write the while condition:',
        template: `int count = 0;\nwhile (___) {\n  moveForward();\n  count++;\n}`,
        question: 'Keep moving while count is less than 5:',
        expectedAnswer: 'count < 5',
        validation: 'condition_correct'
      };
    }

    if (term.includes('compar') || term.includes('operator')) {
      return {
        type: 'multiple-choice',
        instruction: 'Choose the correct operator:',
        template: `if (x ${this.randomNum(5, 10)} ___ 10) {\n  // do something\n}`,
        question: `Which operator checks if x is greater than or equal to 10?`,
        options: ['>', '<', '>=', '<=', '==', '!='],
        correctAnswer: '>='
      };
    }

    // Default
    return {
      type: 'conceptual',
      instruction: `Demonstrate your understanding of ${concept.term}:`,
      question: `What is "${concept.term}" and when would you use it?`
    };
  }

  /**
   * Generate combined code problem
   */
  static generateCombinedCodeProblem(concepts) {
    const terms = concepts.map(c => c.term.toLowerCase());

    // Check which concepts we're combining
    const hasIf = terms.some(t => t.includes('if'));
    const hasFor = terms.some(t => t.includes('for') || t.includes('loop'));
    const hasWhile = terms.some(t => t.includes('while'));
    const hasComparison = terms.some(t => t.includes('compar') || t.includes('operator'));

    if (hasIf && hasFor) {
      return {
        type: 'code',
        instruction: 'Complete the program:',
        template: `// Flash LED 3 times, then check temperature
for (int i = 0; i < 3; i++) {\n  flashLED();\n}\n\nint temp = readTemp();\n___ (temp ___ 30) {\n  alertUser();\n}`,
        question: 'Fill in the if statement: alert if temp is greater than 30',
        expectedParts: ['if', '>', '30'],
        partialCredit: true
      };
    }

    if (hasWhile && hasIf) {
      return {
        type: 'code',
        instruction: 'Write the complete program:',
        template: `// Keep checking sensors until safe
while (___) {\n  int sensor = readSensor();\n  ___(sensor ___ 100) {\n    alarm();\n  }\n}`,
        question: 'Keep running while not safe. Alert if sensor exceeds 100.',
        expectedParts: ['!safe', 'if', '>'],
        partialCredit: true
      };
    }

    if (hasFor && hasComparison) {
      return {
        type: 'code',
        instruction: 'Complete the loop and condition:',
        template: `// Check all sensors
for (int i = 0; i < 5; i++) {\n  int val = readSensor(i);\n  if (val ___ 50) {\n    count++;\n  }\n}`,
        question: 'Count sensors that read GREATER THAN 50',
        expectedParts: ['>'],
        partialCredit: false
      };
    }

    // Default combined problem
    return {
      type: 'explanation',
      instruction: `Explain how ${concepts.map(c => `"${c.term}"`).join(' and ')} work together:`,
      question: 'Describe the logic flow when using both concepts:'
    };
  }

  /**
   * Generate final code problem
   */
  static generateFinalCodeProblem(concepts) {
    return {
      type: 'comprehensive-code',
      instruction: 'Write a complete Arduino program that uses ALL concepts:',

      requirements: concepts.map(c => ({
        concept: c.term,
        mustUse: true
      })),

      template: `// Arduino Control System
// Concepts to use: ${concepts.map(c => c.term).join(', ')}

void setup() {
  // Initialize pins
}

void loop() {
  // Your code here
}`,

      problem: `Create a program that:
1. Uses a for loop to initialize/check multiple sensors
2. Uses if/else statements for decision making
3. Uses comparison operators to compare values
4. Uses while loop for continuous monitoring
5. Correctly combines all these concepts`,

      evaluationCriteria: {
        usesAllConcepts: 'Must use all listed concepts at least once',
        correctLogic: 'Logic should be coherent and functional',
        compiles: 'Code should be syntactically correct'
      },

      hints: concepts.map((c, i) => `Hint ${i + 1}: ${c.term} - ${this.getBriefExplanation(c)}`)
    };
  }

  /**
   * Generate conceptual problem
   */
  static generateConceptualProblem(concept) {
    return {
      type: 'conceptual',
      instruction: `Demonstrate your understanding of "${concept.term}":`,
      questions: [
        {
          q: `What is "${concept.term}"?`,
          type: 'definition'
        },
        {
          q: `Give an example of when you would use "${concept.term}"`,
          type: 'example'
        }
      ]
    };
  }

  /**
   * Generate combined conceptual problem
   */
  static generateCombinedConceptualProblem(concepts) {
    return {
      type: 'integrated-explanation',
      instruction: `Explain how these concepts work together:`,
      concepts: concepts.map(c => c.term),
      questions: [
        {
          q: `How do ${concepts.map(c => `"${c.term}"`).join(' and ')} relate to each other?`,
          type: 'relationship'
        },
        {
          q: 'Describe a scenario where you would use both:',
          type: 'application'
        }
      ]
    };
  }

  /**
   * Generate final conceptual problem
   */
  static generateFinalConceptualProblem(concepts) {
    return {
      type: 'comprehensive-conceptual',
      instruction: 'Demonstrate mastery of ALL concepts:',
      concepts: concepts.map(c => c.term),
      question: `Create a comprehensive explanation that incorporates ALL ${concepts.length} concepts in a coherent framework. Show how they connect and work together.`
    };
  }

  /**
   * Generate hints for a concept or concepts
   */
  static generateHints(concepts, level) {
    const conceptArray = Array.isArray(concepts) ? concepts : [concepts];

    const hints = [];

    // Level 1 hints (direct concept reminders)
    if (level === 1) {
      const concept = conceptArray[0];
      hints.push(`Remember: ${this.getConceptReminder(concept)}`);
      hints.push(`Think about the basic definition of ${concept.term}`);
      hints.push(`Review the teaching module for ${concept.term}`);
    } else {
      // Multi-concept hints
      hints.push(`Break down the problem: solve each concept part separately first`);
      hints.push(`Remember how ${conceptArray.slice(0, -1).map(c => c.term).join(', ')} work from earlier`);
      hints.push(`Think about the connection: ${this.explainConceptConnections(conceptArray)}`);
    }

    return hints;
  }

  /**
   * Get reminder text for a concept
   */
  static getConceptReminder(concept) {
    const term = concept.term.toLowerCase();

    const reminders = {
      'if': 'if checks if a condition is true - if true, the code inside runs',
      'for': 'for loop repeats a specific number of times - for (start; condition; update)',
      'while': 'while loop keeps repeating while a condition is true',
      'comparison': 'comparison operators (> < == != >= <=) compare two values',
      'operator': 'operators perform actions on values',
      'boolean': 'boolean values are true or false'
    };

    for (const [key, reminder] of Object.entries(reminders)) {
      if (term.includes(key)) return reminder;
    }

    return concept.definition || `Review what ${concept.term} means`;
  }

  /**
   * Get brief explanation for a concept
   */
  static getBriefExplanation(concept) {
    const term = concept.term.toLowerCase();

    const explanations = {
      'if': 'makes decisions based on true/false',
      'for': 'repeats code a set number of times',
      'while': 'repeats code while a condition holds',
      'comparison': 'compares values and returns true/false',
      'operator': 'performs operations on data',
      'boolean': 'represents true or false'
    };

    for (const [key, exp] of Object.entries(explanations)) {
      if (term.includes(key)) return exp;
    }

    return concept.definition ? concept.definition.substring(0, 50) : 'a key concept';
  }

  /**
   * Explain how concepts connect
   */
  static explainConceptConnections(concepts) {
    if (concepts.length < 2) return 'No connections to explain';

    const connections = [];
    for (let i = 0; i < concepts.length - 1; i++) {
      const curr = concepts[i].term.toLowerCase();
      const next = concepts[i + 1].term.toLowerCase();

      if ((curr.includes('if') || curr.includes('comparison')) && next.includes('loop')) {
        connections.push('if conditions often control when loops run or stop');
      }
      if (curr.includes('loop') && next.includes('if')) {
        connections.push('loops often contain if statements to make decisions inside repetitions');
      }
      if (curr.includes('comparison') || curr.includes('operator')) {
        connections.push('comparison operators are used inside if conditions and while conditions');
      }
    }

    if (connections.length === 0) {
      return 'These concepts can be combined to solve more complex problems';
    }

    return connections.join('; ');
  }

  /**
   * Get level description
   */
  static getLevelDescription(level, totalConcepts) {
    if (level === 1) {
      return 'Practice each concept individually';
    }
    return `Practice combining ${level} concepts at a time (building up to all ${totalConcepts})`;
  }

  /**
   * Get solution approach for final challenge
   */
  static getSolutionApproach(concepts) {
    return `Recommended approach:
1. First, sketch out which concept goes where
2. Start with the loop structure (for or while)
3. Add conditions (if) inside or around the loop
4. Use comparison operators in your conditions
5. Test each part separately before combining
6. Verify all concepts are used at least once`;
  }

  // ========== Utility Methods ==========

  static randomTemp() {
    return Math.floor(Math.random() * 20) + 20; // 20-40°C
  }

  static randomNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = SpiralPracticeGenerator;