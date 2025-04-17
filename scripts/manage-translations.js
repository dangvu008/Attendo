// Script to run the translation management tool
const { execSync } = require('child_process');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

// Path to the translation manager
const translationManagerPath = path.join(__dirname, '..', 'i18n', 'tools', 'translation-manager.js');

try {
  switch (command) {
    case 'find-missing':
      console.log('Finding missing translations...');
      execSync(`node ${translationManagerPath} find-missing`, { stdio: 'inherit' });
      break;
    
    case 'generate-template':
      console.log('Generating templates for missing translations...');
      execSync(`node ${translationManagerPath} generate-template`, { stdio: 'inherit' });
      break;
    
    case 'help':
    default:
      console.log('Translation Management Tool');
      console.log('==========================');
      console.log('');
      console.log('Usage: node scripts/manage-translations.js [command]');
      console.log('');
      console.log('Commands:');
      console.log('  find-missing       Find missing translations across all languages');
      console.log('  generate-template  Generate templates for missing translations');
      console.log('  help               Show this help message');
      break;
  }
} catch (error) {
  console.error('Error running translation management tool:', error.message);
  process.exit(1);
}
