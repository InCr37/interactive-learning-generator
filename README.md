# Interactive Learning Generator

A Claude Code skill that transforms traditional learning materials (PDF, DOCX, PPTX, TXT, MD, images) into highly interactive learning experiences through progressive disclosure, contextual narratives, and constructive failure feedback.

## Features

- **Smart Content Analysis**: Automatically identifies key concepts, learning objectives, and难点
- **Pedagogical Design**: Applies 12 teaching principles including progressive disclosure, contextual narrative, and adaptive difficulty
- **Branching Dialogues**: Simulated learning assistant guidance through decision trees
- **Multiple Choice Questions**: Contextualized knowledge application with instant feedback
- **Language Adaptive**: Auto-detects English/Chinese and generates content in the matching language throughout
- **AI Conversation Ready**: Outputs structured JSON for direct use in AI conversations

## Installation

```bash
# Clone into your Claude Code skills directory
git clone https://github.com/YOUR_USERNAME/interactive-learning-generator.git ~/.claude/skills/interactive-learning-generator

# Install dependencies
cd ~/.claude/skills/interactive-learning-generator
npm install
```

**Requirements**: Node.js 18+

## Usage

### Trigger Words

Use any of these phrases to invoke the skill:
- `/interactive-learning-generator`
- `transform this into interactive learning`
- `create interactive learning content`

### Input Formats

- **Documents**: PDF, DOCX, PPTX, TXT, MD
- **Images**: JPG, PNG, GIF (via multimodal extraction)
- **Direct Text**: Paste or type learning materials directly

### Example

1. Prepare your learning material (e.g., a PDF about calculus)
2. Invoke the skill with your content
3. The skill generates:
   - Branching dialogue trees
   - Multiple choice quizzes
   - Interactive exercises
   - Teaching flow sequences

## Output

The skill outputs structured JSON containing:
- `interactiveModules[]` - Teaching, dialogue, quiz, and exercise modules
- `progressiveDisclosure` - Learning path unlock sequence
- `language` - Detected language (en-US or zh-CN)
- `designPrinciplesApplied[]` - Teaching principles used

## Architecture

```
src/
├── index.js              # Main entry, orchestrates pipeline
├── processors/          # File format handlers
├── analyzers/           # Content analysis
├── generators/          # Interactive content generation
├── outputs/             # JSON/HTML rendering
└── ai_adapter/         # AI conversation integration
```
