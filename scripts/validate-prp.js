#!/usr/bin/env node

/**
 * PRP Framework Validation Script
 * Validates the Context Engineering setup and provides feedback
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const requiredFiles = [
  'CLAUDE.md',
  'INITIAL.md',
  'INITIAL_EXAMPLE.md',
  '.claude/settings.local.json',
  '.claude/commands/generate-prp.md',
  '.claude/commands/execute-prp.md',
  'PRPs/templates/prp_base.md',
  'PRPs/youtube-playlist-sync.md',
  'examples/README.md',
  'examples/mcp-tools/basic-tool.ts',
  'examples/tests/mcp-tool.test.ts',
];

const requiredDirectories = [
  '.claude',
  '.claude/commands',
  'PRPs',
  'PRPs/templates',
  'examples',
  'examples/mcp-tools',
  'examples/tests',
];

function checkFile(filePath) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    const stats = fs.statSync(fullPath);
    return {
      exists: true,
      size: stats.size,
      path: fullPath
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
      path: path.join(projectRoot, filePath)
    };
  }
}

function checkDirectory(dirPath) {
  try {
    const fullPath = path.join(projectRoot, dirPath);
    const stats = fs.statSync(fullPath);
    return {
      exists: stats.isDirectory(),
      path: fullPath
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
      path: path.join(projectRoot, dirPath)
    };
  }
}

function validatePRPFramework() {
  console.log('🔍 Validating PRP Framework Setup...\n');

  // Check directories
  console.log('📁 Checking required directories:');
  let directoriesValid = true;
  
  requiredDirectories.forEach(dir => {
    const result = checkDirectory(dir);
    if (result.exists) {
      console.log(`  ✅ ${dir}`);
    } else {
      console.log(`  ❌ ${dir} - ${result.error}`);
      directoriesValid = false;
    }
  });

  console.log('\n📄 Checking required files:');
  let filesValid = true;
  
  requiredFiles.forEach(file => {
    const result = checkFile(file);
    if (result.exists) {
      console.log(`  ✅ ${file} (${result.size} bytes)`);
    } else {
      console.log(`  ❌ ${file} - ${result.error}`);
      filesValid = false;
    }
  });

  // Check file contents
  console.log('\n🔍 Checking file contents:');
  let contentValid = true;

  // Check CLAUDE.md for key sections
  const claudeFile = checkFile('CLAUDE.md');
  if (claudeFile.exists) {
    const content = fs.readFileSync(claudeFile.path, 'utf8');
    if (content.includes('Project Awareness') && content.includes('MCP Server Architecture')) {
      console.log('  ✅ CLAUDE.md contains required sections');
    } else {
      console.log('  ❌ CLAUDE.md missing required sections');
      contentValid = false;
    }
  }

  // Check PRP template
  const prpTemplate = checkFile('PRPs/templates/prp_base.md');
  if (prpTemplate.exists) {
    const content = fs.readFileSync(prpTemplate.path, 'utf8');
    if (content.includes('Validation Loop') && content.includes('Implementation Blueprint')) {
      console.log('  ✅ PRP template contains required sections');
    } else {
      console.log('  ❌ PRP template missing required sections');
      contentValid = false;
    }
  }

  // Check example PRP
  const examplePrp = checkFile('PRPs/youtube-playlist-sync.md');
  if (examplePrp.exists) {
    const content = fs.readFileSync(examplePrp.path, 'utf8');
    if (content.includes('Success Criteria') && content.includes('Confidence Score')) {
      console.log('  ✅ Example PRP contains required sections');
    } else {
      console.log('  ❌ Example PRP missing required sections');
      contentValid = false;
    }
  }

  // Overall validation
  console.log('\n📊 Validation Summary:');
  const overallValid = directoriesValid && filesValid && contentValid;
  
  if (overallValid) {
    console.log('🎉 PRP Framework setup is COMPLETE!');
    console.log('\n🚀 Next Steps:');
    console.log('1. Edit INITIAL.md with your feature requirements');
    console.log('2. Run: /generate-prp INITIAL.md');
    console.log('3. Run: /execute-prp PRPs/your-feature.md');
  } else {
    console.log('❌ PRP Framework setup is INCOMPLETE');
    console.log('\n🔧 Required Actions:');
    if (!directoriesValid) console.log('- Create missing directories');
    if (!filesValid) console.log('- Create missing files');
    if (!contentValid) console.log('- Fix file contents');
  }

  return overallValid;
}

// Run validation
const isValid = validatePRPFramework();
process.exit(isValid ? 0 : 1);
