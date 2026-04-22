#!/usr/bin/env node

/**
 * CLI entry point for interactive-learning-generator
 */
const path = require('path');
const fs = require('fs-extra');
const { generateInteractiveLearning } = require('./index.js');

const HELP = `
Interactive Learning Generator
Transform learning materials into interactive experiences

Usage:
  ilg <input> [options]      Generate interactive learning from file or text
  ilg --help                 Show this help message
  ilg --version              Show version

Options:
  -i, --input <path>         Input file path (PDF, DOCX, PPTX, TXT, MD, PNG, JPG)
  -t, --text <text>          Input text directly
  -f, --format <format>     Output format: html, twine, json (default: html)
  -a, --audience <type>      Target audience: student, self-learner, professional (default: student)
  -o, --output <path>        Output file/directory path
  -l, --language <lang>      Force language: en, zh (auto-detected by default)
  --no-visuals               Disable visual illustration generation
  --no-preview              Skip browser preview

Examples:
  ilg ./my-notes.pdf
  ilg -t "What is photosynthesis?" -f html
  ilg ./lecture.pptx -a professional -o ./output
`;

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    process.exit(0);
  }

  if (args.includes('--version') || args.includes('-v')) {
    const pkg = require('../package.json');
    console.log(pkg.version);
    process.exit(0);
  }

  // Parse arguments
  const options = {
    input: null,
    inputType: 'text',
    outputFormat: 'html',
    targetAudience: 'student',
    generateVisuals: true,
    previewInBrowser: true,
    outputPath: null,
    language: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '-i':
      case '--input':
        options.input = next;
        options.inputType = 'file';
        i++;
        break;
      case '-t':
      case '--text':
        options.input = next;
        options.inputType = 'text';
        i++;
        break;
      case '-f':
      case '--format':
        options.outputFormat = next;
        i++;
        break;
      case '-a':
      case '--audience':
        options.targetAudience = next;
        i++;
        break;
      case '-o':
      case '--output':
        options.outputPath = next;
        i++;
        break;
      case '-l':
      case '--language':
        options.language = next;
        i++;
        break;
      case '--no-visuals':
        options.generateVisuals = false;
        break;
      case '--no-preview':
        options.previewInBrowser = false;
        break;
      default:
        if (!arg.startsWith('-')) {
          // Positional argument treated as input file
          options.input = arg;
          options.inputType = 'file';
        }
    }
  }

  if (!options.input) {
    console.error('Error: Input is required. Use --input <file> or --text <content>');
    console.error('Run "ilg --help" for usage information.');
    process.exit(1);
  }

  // Execute
  try {
    console.log('🎓 Interactive Learning Generator\n');

    const result = await generateInteractiveLearning(
      { logger: console },
      options
    );

    if (result.success) {
      console.log('\n✅ Generation complete!');
      console.log(`📁 Output: ${result.output.path}`);
      if (result.preview) {
        console.log(`🔗 Preview: ${result.preview}`);
      }
    } else {
      console.error('\n❌ Generation failed:', result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();