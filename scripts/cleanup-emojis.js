/**
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

// NeuralEdge AI - Emoji Cleanup Script
// Removes all emojis and Unicode characters from project files

const fs = require('fs');
const path = require('path');

class EmojiCleanup {
  constructor() {
    this.emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]/gu;
    this.cleanupResults = {
      filesProcessed: 0,
      filesModified: 0,
      emojisRemoved: 0,
      errors: []
    };
  }

  cleanupFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const originalLength = content.length;
      
      // Count emojis before removal
      const emojiMatches = content.match(this.emojiPattern);
      const emojiCount = emojiMatches ? emojiMatches.length : 0;
      
      // Remove emojis
      const cleanedContent = content.replace(this.emojiPattern, '');
      
      this.cleanupResults.filesProcessed++;
      
      if (emojiCount > 0) {
        fs.writeFileSync(filePath, cleanedContent, 'utf8');
        this.cleanupResults.filesModified++;
        this.cleanupResults.emojisRemoved += emojiCount;
        
        console.log(`Cleaned ${filePath}: ${emojiCount} emojis removed`);
      }
      
    } catch (error) {
      this.cleanupResults.errors.push(`Error processing ${filePath}: ${error.message}`);
    }
  }

  cleanupDirectory(dirPath, extensions = ['.md', '.ts', '.js', '.tsx', '.jsx', '.json']) {
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Skip node_modules and .git directories
          if (!['node_modules', '.git', 'dist'].includes(item)) {
            this.cleanupDirectory(itemPath, extensions);
          }
        } else {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            this.cleanupFile(itemPath);
          }
        }
      }
    } catch (error) {
      this.cleanupResults.errors.push(`Error reading directory ${dirPath}: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\nEmoji Cleanup Report:');
    console.log('====================');
    console.log(`Files processed: ${this.cleanupResults.filesProcessed}`);
    console.log(`Files modified: ${this.cleanupResults.filesModified}`);
    console.log(`Emojis removed: ${this.cleanupResults.emojisRemoved}`);
    
    if (this.cleanupResults.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.cleanupResults.errors.forEach(error => console.log(`- ${error}`));
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, '..', 'emoji-cleanup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.cleanupResults, null, 2));
    console.log(`\nDetailed report saved: ${reportPath}`);
  }

  run() {
    console.log('Starting emoji cleanup process...');
    
    const projectRoot = path.join(__dirname, '..');
    this.cleanupDirectory(projectRoot);
    
    this.generateReport();
    
    return this.cleanupResults.emojisRemoved === 0;
  }
}

// Execute cleanup if run directly
if (require.main === module) {
  const cleanup = new EmojiCleanup();
  const isClean = cleanup.run();
  
  if (isClean) {
    console.log('\nProject is emoji-free and ready for commercial release.');
    process.exit(0);
  } else {
    console.log('\nEmoji cleanup completed. Run script again to verify all emojis removed.');
    process.exit(1);
  }
}

module.exports = EmojiCleanup;