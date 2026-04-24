/**
 * TeachingFlowGenerator - Beginner-Friendly Teaching Flow Generator
 *
 * Generates teaching-first learning modules that ensure concepts are explained
 * before any testing occurs. Implements:
 * - Proactive teaching (explain before quiz)
 * - Progressive code building (step-by-step code construction)
 * - Understanding confirmation (verify before proceeding)
 * - Chunked delivery (small, digestible pieces)
 * - Visual code highlighting (syntax highlighting with explanations)
 * - Real-time struggle detection (adaptive help)
 */

class TeachingFlowGenerator {
  /**
   * Generate beginner-friendly teaching flow
   * @param {Array} concepts - Concepts to teach
   * @param {Object} narrativeFramework - Narrative context
   * @param {Object} difficultyAssessment - Difficulty assessment
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Teaching flow modules
   */
  static async generate(concepts, narrativeFramework, difficultyAssessment, options = {}) {
    const isBeginner = difficultyAssessment.overallDifficulty < 5;
    const isProgramming = this.isProgrammingRelated(concepts);

    // Get optimization directives for adaptive teaching
    const { optimizationDirectives, learnerProfile } = options || {};
    const teachingStyle = optimizationDirectives?.teachingStyle || 'standard';

    const teachingModules = [];

    // For each concept, generate a teaching-first module
    for (let i = 0; i < concepts.length; i++) {
      const concept = concepts[i];
      const module = await this.createTeachingModule(
        concept,
        narrativeFramework,
        difficultyAssessment,
        isProgramming,
        i,
        { optimizationDirectives, learnerProfile, teachingStyle }
      );
      teachingModules.push(module);

      // Add understanding check after each teaching module
      const understandingCheck = this.createUnderstandingCheck(concept, i);
      teachingModules.push(understandingCheck);

      // Add practice exercise after understanding check
      const practice = this.createPracticeForConcept(concept, i, isProgramming);
      teachingModules.push(practice);
    }

    return teachingModules;
  }

  /**
   * Create a teaching module for a single concept
   */
  static async createTeachingModule(concept, narrativeFramework, difficultyAssessment, isProgramming, index, options = {}) {
    const isBeginner = difficultyAssessment.overallDifficulty < 5;
    const { optimizationDirectives, learnerProfile, teachingStyle } = options || {};

    // For programming concepts, use progressive code building
    if (isProgramming && concept.codeExample) {
      return this.createProgressiveCodeTeaching(concept, index, { optimizationDirectives, teachingStyle });
    }

    // For non-programming or concepts without code, create conceptual teaching
    return this.createConceptualTeaching(concept, narrativeFramework, index, isBeginner, { optimizationDirectives, teachingStyle });
  }

  /**
   * Create progressive code teaching module
   * Builds code step-by-step, explaining each part
   */
  static createProgressiveCodeTeaching(concept, index, options = {}) {
    const { teachingStyle } = options || {};
    const codeExample = concept.codeExample;
    const lines = codeExample.split('\n').filter(line => line.trim());

    // Break code into progressive steps
    const steps = this.breakCodeIntoSteps(lines);

    // Adjust based on teaching style
    let estimatedTime = 3 + (steps.length * 0.5);
    let includeAnalogies = true;
    let examplesPerConcept = 2;

    if (teachingStyle === 'remedial') {
      estimatedTime *= 1.3; // More time for struggling learners
      includeAnalogies = true;
      examplesPerConcept = 3;
    } else if (teachingStyle === 'advanced') {
      estimatedTime *= 0.7; // Faster for advanced learners
      includeAnalogies = false;
      examplesPerConcept = 1;
    }

    return {
      id: `teaching_${index}`,
      type: 'teaching',
      subtype: 'progressive-code',
      concept: concept.term,
      title: `Learning: ${concept.term}`,
      teachingStyle: teachingStyle || 'standard',

      // Step-by-step content
      steps: steps.map((step, stepIndex) => ({
        stepNumber: stepIndex + 1,
        codeFragment: step.code,
        explanation: this.explainCodeFragment(step.code, step.elements),
        highlightedElements: step.elements, // {keyword, variable, operator, etc.}
        isComplete: stepIndex === steps.length - 1
      })),

      // Teaching metadata
      estimatedTime,
      isBeginnerFriendly: teachingStyle !== 'advanced',
      designPrinciples: [
        'progressive-code-building',
        'visual-code-highlighting',
        'chunked-delivery'
      ],
      adaptiveMetadata: {
        teachingStyle,
        includeAnalogies,
        examplesPerConcept
      },
      // Natural transition hint for UI layer - no CLI-style prompts
      transitionHint: 'Ready for a practice problem?',
      noCliPrompts: true
    };
  }

  /**
   * Break code into progressive steps
   * Each step introduces minimal new elements
   */
  static breakCodeIntoSteps(codeLines) {
    if (codeLines.length === 0) return [];
    if (codeLines.length === 1) {
      return [{
        code: codeLines[0],
        elements: this.identifyCodeElements(codeLines[0])
      }];
    }

    const steps = [];

    // Step 1: Basic structure (first line with if/for/while)
    for (let i = 0; i < codeLines.length; i++) {
      const line = codeLines[i];
      const elements = this.identifyCodeElements(line);

      steps.push({
        code: line,
        elements: elements,
        isIncremental: i > 0
      });
    }

    return steps;
  }

  /**
   * Identify elements in a line of code for highlighting
   */
  static identifyCodeElements(codeLine) {
    const elements = {
      keywords: [],
      variables: [],
      operators: [],
      numbers: [],
      punctuation: [],
      functions: []
    };

    // Common Arduino/C keywords
    const keywords = ['if', 'else', 'for', 'while', 'void', 'int', 'return', 'const', 'digitalWrite', 'digitalRead', 'analogWrite', 'analogRead', 'pinMode', 'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'delay'];
    const operators = ['<', '>', '<=', '>=', '==', '!=', '&&', '||', '!', '++', '--', '+=', '-=', '+', '-', '*', '/'];
    const punctuation = ['(', ')', '{', '}', ';', ','];

    // Simple regex-based identification
    const tokens = codeLine.split(/\s+/);

    for (const token of tokens) {
      // Check for keywords
      if (keywords.includes(token)) {
        elements.keywords.push(token);
      }
      // Check for operators
      else if (operators.some(op => token.includes(op))) {
        const found = operators.filter(op => token.includes(op));
        elements.operators.push(...found);
      }
      // Check for numbers
      else if (/^\d+$/.test(token)) {
        elements.numbers.push(token);
      }
      // Check for punctuation
      else if (punctuation.some(p => token.includes(p))) {
        const found = punctuation.filter(p => token.includes(p));
        elements.punctuation.push(...found);
      }
      // Check for function calls (words followed by parenthesis)
      else if (token.includes('(')) {
        elements.functions.push(token.replace('(', ''));
      }
      // Otherwise, likely a variable
      else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(token)) {
        elements.variables.push(token);
      }
    }

    return elements;
  }

  /**
   * Generate explanation for a code fragment
   */
  static explainCodeFragment(code, elements) {
    const explanations = [];

    if (elements.keywords.length > 0) {
      const keywordExplanations = {
        'if': 'means "IF" - check if a condition is true',
        'else': 'means "OTHERWISE" - what to do if condition was false',
        'for': 'means "REPEAT" - loop a specific number of times',
        'while': 'means "KEEP REPEATING" - loop while condition is true',
        'void': 'means this function does not return any value',
        'int': 'means "integer" - a whole number like 1, 2, 3',
        'digitalWrite': 'sends ON or OFF signal to a pin',
        'digitalRead': 'reads ON or OFF from a pin',
        'pinMode': 'sets a pin as INPUT or OUTPUT',
        'HIGH': 'means ON (like voltage is high)',
        'LOW': 'means OFF (like voltage is low)',
        'INPUT': 'means this pin receives signals',
        'OUTPUT': 'means this pin sends signals',
        'delay': 'waits for a number of milliseconds'
      };

      for (const kw of elements.keywords) {
        if (keywordExplanations[kw]) {
          explanations.push(`"${kw}" ${keywordExplanations[kw]}`);
        }
      }
    }

    if (elements.operators.length > 0) {
      const operatorExplanations = {
        '>': 'means "greater than"',
        '<': 'means "less than"',
        '>=': 'means "greater than or equal to"',
        '<=': 'means "less than or equal to"',
        '==': 'means "is equal to" (checking equality, not assignment)',
        '!=': 'means "is NOT equal to"',
        '&&': 'means "AND" - both must be true',
        '||': 'means "OR" - either can be true',
        '!': 'means "NOT" - inverts true/false'
      };

      for (const op of elements.operators) {
        if (operatorExplanations[op]) {
          explanations.push(`"${op}" ${operatorExplanations[op]}`);
        }
      }
    }

    if (explanations.length === 0) {
      explanations.push('This line sets up part of the program structure.');
    }

    return explanations.join('. ') + '.';
  }

  /**
   * Create conceptual teaching for non-code concepts
   */
  static createConceptualTeaching(concept, narrativeFramework, index, isBeginner, options = {}) {
    const { teachingStyle } = options || {};

    // Adjust content based on teaching style
    const includeAnalogies = teachingStyle !== 'advanced';
    const includeRemedial = teachingStyle === 'remedial';
    const languageSimplified = teachingStyle === 'remedial';

    return {
      id: `teaching_${index}`,
      type: 'teaching',
      subtype: 'conceptual',
      concept: concept.term,
      title: `Learning: ${concept.term}`,
      teachingStyle: teachingStyle || 'standard',

      content: {
        // Real-world analogy for beginners (unless advanced)
        analogy: includeAnalogies ? this.generateAnalogy(concept) : null,

        // Core explanation
        explanation: concept.definition || `Understanding ${concept.term} is important for the topic.`,

        // Key points (bulleted, simple)
        keyPoints: languageSimplified ? this.extractSimplifiedKeyPoints(concept) : this.extractKeyPoints(concept),

        // Everyday example (unless advanced)
        everydayExample: includeAnalogies ? this.generateEverydayExample(concept) : null
      },

      // Language adaptation based on teaching style
      languageNote: languageSimplified ? 'Using simplified language with extra examples.' : (isBeginner ? 'Using simple language with examples.' : null),

      estimatedTime: teachingStyle === 'remedial' ? 4 : 3,
      isBeginnerFriendly: teachingStyle !== 'advanced',
      designPrinciples: [
        'proactive-teaching',
        'chunked-delivery'
      ],

      // Understanding confirmation checkpoint
      confirmationPrompt: `Does this make sense? Can you explain "${concept.term}" in your own words?`,
      confirmationOptions: [
        {
          id: 'confirm_yes',
          text: 'Yes, I understand',
          feedback: 'Great! Let\'s move on to practice.',
          next: `quiz_${index}`
        },
        {
          id: 'confirm_no',
          text: 'No, I need more explanation',
          feedback: 'Let me clarify. The key point is...',
          next: `teaching_${index}_remedial`
        }
      ],
      remedialTeaching: {
        id: `teaching_${index}_remedial`,
        type: 'teaching',
        subtype: 'remedial',
        title: `Review: ${concept.term}`,
        content: {
          explanation: this.generateRemedialExplanation(concept),
          simplifiedAnalogy: this.generateSimplifiedAnalogy(concept),
          keyPoints: this.extractSimplifiedKeyPoints(concept)
        },
        transitionHint: 'Try explaining it in your own words now.',
        noCliPrompts: true
      },

      // Natural transition hint for UI layer - no CLI-style prompts
      transitionHint: 'Let me know when you\'re ready to practice, or if something is unclear.',
      noCliPrompts: true
    };
  }

  /**
   * Generate simplified explanation for remedial teaching
   */
  static generateRemedialExplanation(concept) {
    if (concept.definition) {
      return `Let's break this down: ${concept.definition}`;
    }
    return `Think of "${concept.term}" as something that helps us understand the bigger picture. Let me explain it differently...`;
  }

  /**
   * Generate a simpler analogy for struggling learners
   */
  static generateSimplifiedAnalogy(concept) {
    const term = concept.term.toLowerCase();
    // More basic analogies
    const simpleAnalogies = {
      'improper integral': 'Like measuring an infinitely long rope - you keep measuring until it never ends, but sometimes the total length is still finite.',
      'sequence': 'Like a list of numbers written one after another: first number, second number, third number...',
      'convergence': 'Like a ball rolling and eventually stopping at the bottom of a bowl - it gets closer and closer to a point and stays there.',
      'limit': 'Like getting arbitrarily close to a destination without actually arriving.',
      'bounded': 'Like being inside a room - no matter where you go, you can\'t leave the room\'s walls.',
      'monotonic': 'Like walking only uphill (increasing) or only downhill (decreasing) - you never change direction.'
    };

    for (const [key, analogy] of Object.entries(simpleAnalogies)) {
      if (term.includes(key) || key.includes(term)) {
        return analogy;
      }
    }
    return `A simple way to think about "${concept.term}": imagine it as a rule or pattern that helps us solve problems.`;
  }

  /**
   * Extract simplified key points for remedial teaching
   */
  static extractSimplifiedKeyPoints(concept) {
    const keyPoints = [];
    if (concept.definition) {
      keyPoints.push(`Core idea: ${concept.definition}`);
    }
    keyPoints.push('Take your time to understand this before moving on.');
    return keyPoints;
  }

  /**
   * Generate analogy for a concept
   */
  static generateAnalogy(concept) {
    const term = concept.term.toLowerCase();
    const analogies = {
      'if': 'Like a traffic light: IF green light, THEN go. IF red light, THEN stop.',
      'for': 'Like counting repetitions: FOR 5 times, do a push-up. You know exactly how many.',
      'while': 'Like waiting: WHILE raining, wait inside. You keep waiting until it stops.',
      'variable': 'Like a labeled box: A variable named "age" is a box that holds a number representing age.',
      'function': 'Like a recipe: A function is a reusable recipe that you can follow anytime.',
      'loop': 'Like walking in circles: A loop means doing the same thing over and over.',
      'boolean': 'Like a light switch: Boolean is just ON (true) or OFF (false).'
    };

    for (const [key, analogy] of Object.entries(analogies)) {
      if (term.includes(key) || key.includes(term)) {
        return analogy;
      }
    }

    return `Think of "${concept.term}" like a tool that helps accomplish a specific task.`;
  }

  /**
   * Generate everyday example
   */
  static generateEverydayExample(concept) {
    const term = concept.term.toLowerCase();
    const examples = {
      'if': 'IF hungry THEN eat. IF tired THEN rest.',
      'for': 'FOR each guest at a party, prepare one plate. (You know how many guests)',
      'while': 'WHILE waiting for the bus, check your phone. (Keep checking until bus arrives)',
      'variable': 'Your age changes each year. A variable is like a name tag for a value that can change.',
      'boolean': 'A light switch is boolean - it\'s either ON or OFF, nothing in between.'
    };

    for (const [key, example] of Object.entries(examples)) {
      if (term.includes(key) || key.includes(term)) {
        return example;
      }
    }

    return null;
  }

  /**
   * Extract key points from concept
   */
  static extractKeyPoints(concept) {
    const keyPoints = [];

    if (concept.definition) {
      keyPoints.push(`Definition: ${concept.definition}`);
    }

    if (concept.characteristics) {
      if (Array.isArray(concept.characteristics)) {
        keyPoints.push(...concept.characteristics.slice(0, 3));
      }
    }

    // Default key points based on term
    const term = concept.term.toLowerCase();
    if (term.includes('operator')) {
      keyPoints.push('Operators perform actions on values');
      keyPoints.push('Common operators: +, -, *, /, ==, <, >');
    }

    return keyPoints.slice(0, 4); // Max 4 key points
  }

  /**
   * Create understanding check module
   */
  static createUnderstandingCheck(concept, index) {
    return {
      id: `understand_check_${index}`,
      type: 'understanding-check',
      concept: concept.term,
      title: `Check Your Understanding: ${concept.term}`,

      // Questions that require active output, not just recognition
      questions: [
        {
          id: 'explain',
          question: `Can you explain "${concept.term}" in your own words?`,
          type: 'open-ended',
          prompt: 'Try to explain it as if teaching a friend.'
        },
        {
          id: 'example',
          question: `Can you give an example of when you would use "${concept.term}"?`,
          type: 'example-generation',
          prompt: 'Think of a real situation where this would apply.'
        }
      ],

      // Alternative for non-beginners or quick mode
      quickCheck: {
        question: `Which best describes "${concept.term}"?`,
        options: this.generateSimpleOptions(concept),
        correctIndex: 0 // First option is always correct (it's the right description)
      },

      estimatedTime: 2,
      designPrinciples: ['understanding-confirmation'],
      // Natural transition hint for UI layer
      transitionHint: 'Understanding this concept is important before we move on.',
      noCliPrompts: true
    };
  }

  /**
   * Generate simple multiple choice options for quick check
   */
  static generateSimpleOptions(concept) {
    const term = concept.term.toLowerCase();

    // Programming-related options
    if (this.isProgrammingRelated([concept])) {
      return [
        `Correct description of ${concept.term}`,
        `Something completely unrelated`,
        `Opposite behavior of ${concept.term}`,
        `Only applies in specific cases`
      ];
    }

    // General options
    return [
      `A key concept in this topic`,
      `Unrelated to this subject`,
      `The opposite of the correct definition`,
      `Only used in special situations`
    ];
  }

  /**
   * Create practice exercise for concept
   */
  static createPracticeForConcept(concept, index, isProgramming) {
    if (isProgramming && concept.codeExample) {
      return this.createCodePractice(concept, index);
    }

    return this.createConceptualPractice(concept, index);
  }

  /**
   * Create code practice (fill in the blank, predict output, etc.)
   */
  static createCodePractice(concept, index) {
    return {
      id: `practice_${index}`,
      type: 'practice',
      subtype: 'code-application',
      concept: concept.term,
      title: `Practice: ${concept.term}`,

      exercises: [
        {
          id: 'predict',
          instruction: 'What do you think this code will do?',
          codeSnippet: this.createSimpleCodeSnippet(concept),
          question: 'Predict the output or behavior:',
          options: [
            'It will work correctly',
            'It will cause an error',
            'It will do nothing',
            'Cannot determine'
          ],
          correctAnswer: 0
        },
        {
          id: 'complete',
          instruction: 'Fill in the missing part:',
          codeSnippet: this.createIncompleteSnippet(concept),
          question: 'What completes this code?',
          hint: `Think about what "${concept.term}" does.`
        }
      ],

      // Hints available on request
      hints: this.generateHints(concept),

      estimatedTime: 2,
      designPrinciples: [
        'problem-solving-opportunities',
        'constructive-failure'
      ],
      // Natural transition hint for UI layer
      transitionHint: 'Take your time with this exercise.',
      noCliPrompts: true
    };
  }

  /**
   * Create simple code snippet for practice
   */
  static createSimpleCodeSnippet(concept) {
    const term = concept.term.toLowerCase();

    if (term.includes('if')) {
      return `int x = 5;
if (x > 3) {
  // What happens here?
}`;
    }

    if (term.includes('for') || term.includes('loop')) {
      return `for (int i = 0; i < 3; i++) {
  // What happens here?
}`;
    }

    if (term.includes('while')) {
      return `int count = 0;
while (count < 2) {
  // What happens here?
}`;
    }

    return `// Example using ${concept.term}
someFunction();`;
  }

  /**
   * Create incomplete snippet for fill-in practice
   */
  static createIncompleteSnippet(concept) {
    const term = concept.term.toLowerCase();

    if (term.includes('if')) {
      return `int x = 10;
if (x ___ 5) {
  // do something
}
// Fill in the correct operator`;
    }

    if (term.includes('for') || term.includes('loop')) {
      return `___ (int i = 0; i < 5; i++) {
  // repeat something
}
// What keyword starts this loop?`;
    }

    return `// Complete using ${concept.term}
___ ;
// What goes here?`;
  }

  /**
   * Generate hints for concept
   */
  static generateHints(concept) {
    const term = concept.term.toLowerCase();

    const hintMap = {
      'if': [
        'Think: "if" checks if something is true',
        'It needs parentheses around the condition',
        'It uses >, <, ==, etc. to compare values'
      ],
      'for': [
        'Think: "for" repeats a known number of times',
        'It has three parts: start, condition, increment',
        'It looks like: for (init; condition; update)'
      ],
      'while': [
        'Think: "while" keeps going until something is false',
        'It only needs one condition in parentheses',
        'Make sure the condition eventually becomes false!'
      ],
      'variable': [
        'Think: a variable is like a labeled box storing a value',
        'Variables have names and hold data',
        'You can change the value in the box'
      ]
    };

    for (const [key, hints] of Object.entries(hintMap)) {
      if (term.includes(key) || key.includes(term)) {
        return hints;
      }
    }

    return [
      `Think about what ${concept.term} means`,
      `Recall the explanation from earlier`,
      `Apply the same logic to this example`
    ];
  }

  /**
   * Create conceptual practice (application questions)
   */
  static createConceptualPractice(concept, index) {
    return {
      id: `practice_${index}`,
      type: 'practice',
      subtype: 'conceptual-application',
      concept: concept.term,
      title: `Practice: ${concept.term}`,

      exercises: [
        {
          id: 'apply',
          instruction: `When would you use "${concept.term}"?`,
          question: 'Choose the best situation:',
          options: this.generateApplicationOptions(concept),
          correctAnswer: 0
        }
      ],

      estimatedTime: 1,
      designPrinciples: ['problem-solving-opportunities'],
      // Natural transition hint for UI layer
      transitionHint: 'Think about how this concept applies in real scenarios.',
      noCliPrompts: true
    };
  }

  /**
   * Generate application options for conceptual practice
   */
  static generateApplicationOptions(concept) {
    const term = concept.term.toLowerCase();

    if (term.includes('operator')) {
      return [
        'When you need to perform calculations or comparisons',
        'When you want to store a value',
        'When you need to repeat code',
        'When you want to make a decision'
      ];
    }

    return [
      'A situation where this concept applies',
      'An unrelated situation',
      'Something that uses the opposite concept',
      'A situation where this would cause confusion'
    ];
  }

  /**
   * Check if concepts are programming-related
   */
  static isProgrammingRelated(concepts) {
    const programmingKeywords = [
      'code', 'programming', 'function', 'variable', 'loop', 'if', 'else',
      'arduino', 'python', 'javascript', 'algorithm', 'syntax', 'statement',
      'operator', 'boolean', 'digital', 'analog', 'pin', 'output', 'input',
      'led', 'sensor', 'motor', 'circuit', 'microcontroller'
    ];

    const conceptText = concepts.map(c => c.term + ' ' + (c.definition || '')).join(' ').toLowerCase();

    return programmingKeywords.some(keyword => conceptText.includes(keyword));
  }

  /**
   * Integrate spiral practice into the teaching flow
   * Generates cumulative practice problems that grow in complexity
   * @param {Array} teachingModules - The generated teaching modules
   * @param {Array} concepts - All concepts
   * @param {Object} options - Options for spiral generation
   * @returns {Object} Teaching flow with integrated spiral practice
   */
  static integrateSpiralPractice(teachingModules, concepts, options = {}) {
    const SpiralPracticeGenerator = require('./SpiralPracticeGenerator');

    // Separate teaching modules from practice modules
    const pureTeachingModules = teachingModules.filter(m =>
      m.type === 'teaching' && !m.id.includes('understand') && !m.id.includes('practice')
    );

    // Generate spiral practice structure
    const spiralPractice = SpiralPracticeGenerator.generate(
      concepts,
      pureTeachingModules,
      {
        integrationPoint: options.integrationPoint || 2,
        problemsPerLevel: options.problemsPerLevel || 1,
        includeFinalChallenge: options.includeFinalChallenge !== false
      }
    );

    // Build the complete flow with spiral practice
    const completeFlow = {
      teachingModules: teachingModules.filter(m => m.type === 'teaching'),
      understandingChecks: teachingModules.filter(m => m.type === 'understanding-check'),
      basicPractices: teachingModules.filter(m => m.type === 'practice'),
      spiralPractice: spiralPractice,
      flowStructure: {
        phase1_teach: {
          description: 'Learn each concept individually',
          modules: 'teachingModules'
        },
        phase2_basicPractice: {
          description: 'Practice each concept separately',
          modules: 'basicPractices'
        },
        phase3_spiralPractice: {
          description: 'Practice combining concepts progressively',
          levels: spiralPractice.practiceLevels.length
        },
        phase4_finalChallenge: {
          description: 'Comprehensive challenge covering all concepts',
          included: spiralPractice.finalChallenge !== null
        }
      },
      totalDuration: this.estimateTotalTime(teachingModules, spiralPractice)
    };

    return completeFlow;
  }

  /**
   * Estimate total learning time
   */
  static estimateTotalTime(teachingModules, spiralPractice) {
    const teachingTime = teachingModules.reduce((sum, m) => sum + (m.estimatedTime || 3), 0);

    let spiralTime = 0;
    for (const level of spiralPractice.practiceLevels) {
      spiralTime += level.problems.length * 5; // ~5 min per problem
    }

    const finalTime = spiralPractice.finalChallenge ? 10 : 0;

    return {
      teachingMinutes: teachingTime,
      spiralPracticeMinutes: spiralTime,
      finalChallengeMinutes: finalTime,
      totalMinutes: teachingTime + spiralTime + finalTime
    };
  }
}

module.exports = TeachingFlowGenerator;