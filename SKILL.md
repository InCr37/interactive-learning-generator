---
name: interactive-learning-generator
description: "Transform traditional learning materials (PDF/DOCX/PPTX/text/images) into interactive learning experiences using progressive disclosure, contextual narrative, and constructive failure feedback. Generates branching dialogues, multiple-choice questions, and interactive exercises with language-adaptive output (English/Chinese). Outputs structured JSON data for direct use in AI conversations, enabling lightweight deployment across different AI agent platforms."
description_zh: "将传统学习材料（PDF/DOCX/PPTX/文本/图片）转化为高度互动的学习体验，应用渐进式揭露、情境化叙事、建设性失败反馈等教学设计原则，生成分支对话、选择题和互动练习。支持语言自适应（中英文），自动检测输入语言并生成匹配语言的互动内容。输出结构化JSON数据，可直接在AI对话中使用，轻量化适配不同AI agent平台。"
version: "1.3.0"
homepage: ""
allowed-tools: Read,Write,Bash,Edit,Execute
triggers:
  - interactive learning
  - learning material transformation
  - branching dialogue
  - progressive learning
  - multiple choice generation
  - interactive exercises
  - instructional design
  - educational technology
  - learning experience design
  - contextual learning
  - failure as learning
  - progressive disclosure
  - proactive teaching
  - teach before quiz
  - progressive code building
  - understanding confirmation
  - chunked delivery
  - beginner-friendly
examples:
  - "Transform this calculus handout into an interactive learning experience"
  - "Create branching dialogue exercises for this circuit theory chapter"
  - "Generate progressive multiple-choice questions about cell division"
  - "Turn this historical document into a contextual learning module"
  - "Design a learning path for programming concepts using progressive disclosure"
uses_skills:
  - pdf
  - docx
  - pptx
uses_subagents:
  - code-explorer
---

# Progressive Interactive Learning Generator

## Overview

This skill transforms traditional learning materials (PDF, DOCX, PPTX, TXT, MD, images) into highly interactive learning experiences based on modern instructional design principles. Through applying **progressive disclosure**, **contextual narrative**, **constructive failure feedback**, and **seamless teaching flow**, it generates multi-format outputs including branching dialogues, multiple-choice questions, and interactive exercises. The **language adaptive** feature automatically detects the primary language of input materials (English or Chinese) and generates interactive content in the matching language throughout, ensuring linguistic consistency in the learning experience.

**Core Design Philosophy**: Surface gamification elements should be hidden, focusing on the core of instructional design to prevent learner "break of immersion." All interactive design serves conceptual understanding, not game entertainment.

## Input and Output

### Supported Input Formats
- **Documents**: PDF, DOCX, PPTX, TXT, MD
- **Images**: JPG, PNG, GIF (via multimodal content extraction)
- **Direct Text**: Pasted or typed learning materials

### Output Format
1. **JSON Structured Data**: Structured JSON containing complete learning paths, dialogue trees, questions, and feedback data. Can directly drive interactive learning experiences in AI conversations.

## Core Features

### 1. Intelligent Content Analysis
- Automatically identifies key concepts, entities, and relationships in learning materials
- Detects learning objectives and expected mastery levels
- Evaluates conceptual complexity and learning difficulties
- Builds learning path and dependency graphs

### 2. Instructional Design Principles Application
- **Progressive Disclosure**: Decomposes complex concepts into progressive learning units
- **Contextual Narrative**: Embeds learning points into real-world scenarios
- **Constructive Failure Feedback**: Wrong choices trigger detailed cognitive reconstruction, not simple punishment
- **Seamless Teaching Flow**: All theoretical points integrated into problem-solving processes without popup interruptions
- **High-Frequency Questioning**: Each key concept has at least one corresponding question, with diverse question types (choice/short answer/contextual), and questioning timing distributed throughout the learning process
- **Problem-Solving Opportunities**: Allows multiple attempts (default 3), providing progressive hints (concept hint → step guidance → complete solution), with errors triggering constructive feedback
- **Difficulty Scaffolding**: Three-level difficulty system (basic/applied/comprehensive), corresponding to different cognitive levels and success thresholds (70%/50%/30% correct rate targets), ensuring questions are in the Zone of Proximal Development
- **Intelligent Adjustment**: Dynamically adjusts question difficulty, quantity, and feedback based on real-time performance (correct rate, attempts, answer time, error patterns), achieving personalized learning paths
- **Proactive Teaching**: Each concept must be thoroughly explained before practice. Asking questions before explaining concepts is prohibited. Ensures learners build correct mental models before checking understanding.
- **Progressive Code Building**: Code examples must be displayed step-by-step, introducing only one new element at a time. First show structure and skeleton, then gradually fill in details. Uses "first build framework, then progressively fill" presentation method.
- **Understanding Confirmation**: Before moving to the next topic, must confirm the learner truly understands the current content. Uses proactive output-type checks like "Can you explain in your own words?" rather than simple yes/no questions.
- **Chunked Delivery**: Teach only one core concept at a time, providing sufficient time for digestion. Avoids information overload (cognitive load theory). Single teaching unit controlled within 3-5 minutes.
- **Visual Code Highlighting**: Code examples must be accompanied by syntax highlighting and line-by-line explanation. Distinguishes keywords, variables, operators, and other different elements. Uses colors/markers to make code structure clear at a glance.
- **Real-time Struggle Detection**: Automatically identifies learner confusion signals (wrong answers, help requests, long pauses). When difficulty is detected, automatically provides additional explanation or reduces difficulty.
- **Adaptive Language**: Automatically adjusts language complexity based on user preferences and content difficulty. Automatically provides plain explanations or bilingual comparisons when technical terms are detected.

### 3. Interactive Content Generation
- **Branching Dialogue Trees**: Guided Q&A dialogues simulating learning assistant guidance
- **Multiple Choice Questions & Checkpoints**: Contextualized knowledge application with instant feedback
- **Interactive Exercises**: Practical operation scenarios applying learned knowledge to solve problems
- **Visualization Enhancement**: Automatically generates concept diagrams, flowcharts, and other teaching illustrations

### 4. Neutral Interface Design
- No game-specific characters, scenes, or terminology
- Professional educational visual style: clear typography, educational blue/green tones
- Neutral guidance roles: "Learning Assistant", "Knowledge Mentor", "System Guide"
- Focus on learning content, avoiding cognitive distraction

### 5. Language Adaptation
- **Automatic Language Detection**: Analyzes the primary language of input materials (English, Chinese, etc.)
- **Full-Process Language Matching**: If learning materials are primarily in English, the entire interactive learning process (narration, dialogue, feedback, interface) uses English
- **Bilingual Support**: Can handle mixed Chinese-English materials, automatically adjusting output language based on content ratio
- **Terminology Consistency**: Maintains accurate translation and contextual consistency of professional terminology
- **Cultural Adaptability**: Adjusts examples, scenarios, and cultural backgrounds based on target language

## Use Cases

### Educators
- Transform traditional handouts into interactive learning modules
- Create personalized learning paths for students
- Generate formative assessments and exercises

### Self-Learners
- Transform learning notes into interactive review materials
- Create self-tests and knowledge checkpoints
- Understand complex concepts through exploratory learning

### Training Developers
- Transform training materials into immersive learning experiences
- Design contextual case studies and decision exercises
- Create branching training simulations

## Workflow

1. **Input Processing**: Calls corresponding skill to extract structured text based on file type
2. **Concept Analysis**: Identifies key concepts, learning objectives, difficulties, and dependencies
3. **Interactive Design**: Applies instructional design principles to generate branching narratives, multiple-choice questions, and exercises
4. **Content Generation**: (Optional) Calls image generation skill to create teaching illustrations
5. **JSON Output**: Converts interactive content into structured JSON data for direct use in AI conversations

## Technical Implementation

- **Runtime Environment**: Node.js 18+ (compatible with WorkBuddy skill framework)
- **Core Framework**: WorkBuddy Skill API
- **Text Processing**: natural (NLP library), franc (language detection library)
- **JSON Output**: Native JavaScript object serialization, no template dependencies
- **Modular Architecture**: Processor → Analyzer → Generator → JSON serialization pipeline
- **Lightweight Design**: No HTML/Twine template dependencies, minimal external skill dependencies, focused on AI conversation interaction

## Examples

### Input Example (Calculus Concept)
```
## Basic Concepts of Definite Integrals
A definite integral represents the cumulative area under a function over an interval. Mathematical expression: ∫[a,b] f(x)dx.

Key Ideas:
1. Partition: Divide interval [a,b] into n subintervals
2. Approximate: Use rectangular area to approximate the area under the curve in each subinterval
3. Sum: Add up all rectangular areas
4. Take Limit: Let subinterval width approach 0 to get exact area
```

### Output Example (JSON Structured Data)

```json
{
  "version": "1.2.0",
  "language": "en-US",
  "title": "Definite Integral Concepts: Land Surveyor Scenario",
  "description": "Progressive learning of definite integral concepts through land surveyor role-play",
  "scenario": "You are a land surveyor who needs to measure the area of an irregularly shaped piece of land",
  "learningObjectives": [
    "Understand the geometric meaning of definite integral as area accumulation",
    "Master the basic steps of rectangular approximation method",
    "Recognize the effect of increasing partition number on approximation accuracy"
  ],
  "interactiveModules": [
    {
      "id": "dialogue_1",
      "type": "branching_dialogue",
      "role": "learning_assistant",
      "content": "You are analyzing an irregularly shaped piece of land with boundary described by function y = x². As a survey engineer, you need to calculate the area between x=0 and x=2.",
      "choices": [
        {
          "id": "choice_a",
          "text": "Try using the rectangle formula directly",
          "feedback": "The rectangle formula applies to regular rectangular areas, but here the boundary is a curve, requiring a more refined method.",
          "next": "dialogue_2_a"
        },
        {
          "id": "choice_b",
          "text": "Divide the area into multiple small rectangles for estimation",
          "feedback": "Correct! This is a commonly used approximation method in engineering, estimating irregular areas through division and summation.",
          "next": "dialogue_2_b"
        },
        {
          "id": "choice_c",
          "text": "Request to see the function graph and measurement tools",
          "feedback": "Here is the graph of function y=x² and the measurement tools panel.",
          "next": "dialogue_2_c"
        }
      ]
    },
    {
      "id": "quiz_1",
      "type": "multiple_choice",
      "question": "The current approximation (left endpoint method) is 1.75. If the number of partitions increases to 8, the approximation will:",
      "options": [
        { "id": "opt1", "text": "Be closer to the actual area", "correct": true },
        { "id": "opt2", "text": "Be farther from the actual area", "correct": false },
        { "id": "opt3", "text": "Stay the same", "correct": false },
        { "id": "opt4", "text": "Cannot be determined", "correct": false }
      ],
      "feedback": {
        "correct": "Correct! Increasing the number of partitions means smaller rectangle width, and the approximation will be closer to the actual area under the curve.",
        "incorrect": "Increasing the number of partitions improves approximation accuracy because each rectangle fits the curve better."
      }
    }
  ],
  "progressiveDisclosure": {
    "unlockSequence": ["dialogue_1", "quiz_1"],
    "prerequisites": {},
    "estimatedTime": 15
  },
  "metadata": {
    "sourceMaterial": "Calculus handout",
    "generatedAt": "2026-04-18T13:36:00Z",
    "aiConversationReady": true
  }
}
```

## Notes

- **Content Accuracy**: Generated content is based on input materials; human review of key concepts is recommended
- **Technical Dependencies**: Requires installation of corresponding skills (pdf, docx, pptx, etc.) to handle different formats
- **Performance Considerations**: Large documents or complex concepts may require longer processing time
- **Privacy Protection**: All processing is done locally; no data is sent to external servers (unless using image generation)

## AI Conversation Integration

### Design Principles for AI Platforms

Generated JSON modules are designed for AI conversation use. Key principles:

1. **No CLI-style prompts**: Content should NOT contain phrases like "Press Enter to continue" or "Press any key to proceed". These are awkward in conversational AI interfaces.

2. **Natural transitions**: Use the `transitionHint` field (when present) to guide the AI on how to prompt the user, but prefer natural conversational prompts like "Ready to continue?" or "Would you like to practice what you learned?"

3. **Content purity**: The `content` field of modules contains only educational content. Transition guidance belongs in `transitionHint`, not embedded in content.

4. **Flag: `noCliPrompts`**: When `true`, indicates the module was designed without CLI-style prompts and is ready for conversational AI use.

### Module Structure for AI Use

Each module may include these AI-friendly fields:

```json
{
  "id": "teaching_1",
  "type": "teaching",
  "content": "Educational content only - no CLI prompts",
  "transitionHint": "Ready for a practice problem?",
  "noCliPrompts": true
}
```

### Recommended AI Conversation Flow

1. **Present content** naturally as part of the conversation
2. **Reference `transitionHint`** if present, in a conversational way
3. **Wait for user input** - user can respond, ask questions, or say "continue"
4. **Present choices** with IDs that user can type naturally
5. **Process response** and show feedback
6. **Repeat** until module complete

## Changelog

- **v1.0**: Initial version with basic document processing and interactive content generation
- **v1.1**: Added language adaptation (automatic input language detection, full English interaction for English materials) and English trigger words
- **v1.2**: Lightweight refactoring, focused on AI conversation interaction, removed HTML/Twine output, retained JSON structured data, simplified dependencies; **Added four instructional design principles**: high-frequency questioning, problem-solving opportunities, difficulty scaffolding, intelligent adjustment, achieving more personalized and interactive learning experience
- **v1.3**: Added `noCliPrompts` flag and `transitionHint` field, removed CLI-style prompts, supported AI conversation integration

---

*This skill follows WorkBuddy Skill Development Specification and is open source under MIT license.*