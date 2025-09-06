#!/usr/bin/env node

/**
 * Add copyright headers to NeuralEdge AI source files
 * Copyright (c) 2025 Francisco Molina <pako.molina@gmail.com>
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const COPYRIGHT_HEADER = `/**
 * NeuralEdge AI - Enterprise AI Platform
 * 
 * Copyright (c) 2025 Francisco Molina <pako.molina@gmail.com>
 * All rights reserved.
 * 
 * This software is licensed under the NeuralEdge AI Enterprise License.
 * Commercial use requires attribution and royalty payments of 5% gross revenue,
 * with a minimum annual payment of $1,000 USD per commercial entity.
 * 
 * Contact: pako.molina@gmail.com for licensing inquiries.
 * Repository: https://github.com/Yatrogenesis/NeuralEdge-AI
 */

`;

function addCopyrightHeader(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if copyright already exists
    if (content.includes('Copyright (c) 2025 Francisco Molina')) {
      console.log(`Skipping ${filePath} - copyright header already exists`);
      return;
    }
    
    // Skip if file is too small (likely generated or minimal)
    if (content.length < 100) {
      console.log(`Skipping ${filePath} - file too small`);
      return;
    }
    
    const newContent = COPYRIGHT_HEADER + content;
    fs.writeFileSync(filePath, newContent);
    console.log(`Added copyright header to ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and dist directories
        if (file === 'node_modules' || file === 'dist' || file === '.git') {
          continue;
        }
        processDirectory(fullPath);
      } else if (stat.isFile()) {
        // Process TypeScript, JavaScript, and React files
        const ext = path.extname(file).toLowerCase();
        if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
          addCopyrightHeader(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
console.log('Adding copyright headers to NeuralEdge AI source files...');
const projectRoot = path.join(__dirname, '..');
processDirectory(projectRoot);
console.log('Copyright header addition complete!');

// Update package.json to reflect new license
try {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.license = 'SEE LICENSE IN LICENSE.md';
  packageJson.author = 'Francisco Molina <pako.molina@gmail.com>';
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Updated package.json with new license information');
} catch (error) {
  console.error('Error updating package.json:', error.message);
}