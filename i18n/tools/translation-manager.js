const fs = require('fs');
const path = require('path');

// Configuration
const LANGUAGES = ['en', 'vi'];
const NAMESPACES = ['common', 'home', 'settings', 'shifts', 'notes', 'weather', 'backup', 'alarm'];
const TRANSLATIONS_DIR = path.join(__dirname, '..', 'translations');

// Utility functions
function readTranslationFile(language, namespace) {
  try {
    const filePath = path.join(TRANSLATIONS_DIR, language, `${namespace}.js`);
    // Read the file and extract the default export
    const content = fs.readFileSync(filePath, 'utf8');
    // This is a simple way to parse the JS file - in a real app, you might want to use a proper parser
    const jsonStr = content.replace('export default', '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error(`Error reading translation file for ${language}/${namespace}:`, error.message);
    return {};
  }
}

function writeTranslationFile(language, namespace, data) {
  try {
    const filePath = path.join(TRANSLATIONS_DIR, language, `${namespace}.js`);
    const content = `export default ${JSON.stringify(data, null, 2)}`;
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${language}/${namespace} translation file`);
  } catch (error) {
    console.error(`Error writing translation file for ${language}/${namespace}:`, error.message);
  }
}

// Find missing translations
function findMissingTranslations() {
  const missing = {};

  // For each namespace
  NAMESPACES.forEach(namespace => {
    // Get the English translations as the reference
    const enTranslations = readTranslationFile('en', namespace);
    
    // Check each language against English
    LANGUAGES.filter(lang => lang !== 'en').forEach(lang => {
      const langTranslations = readTranslationFile(lang, namespace);
      
      // Find keys in English that are missing in this language
      const missingKeys = findMissingKeys(enTranslations, langTranslations);
      
      if (missingKeys.length > 0) {
        if (!missing[lang]) missing[lang] = {};
        missing[lang][namespace] = missingKeys;
      }
    });
  });

  return missing;
}

// Find keys that are in source but not in target
function findMissingKeys(source, target, prefix = '') {
  let missingKeys = [];
  
  Object.keys(source).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      // Recursively check nested objects
      missingKeys = [
        ...missingKeys,
        ...findMissingKeys(source[key], target[key] || {}, fullKey)
      ];
    } else if (!(key in target)) {
      missingKeys.push(fullKey);
    }
  });
  
  return missingKeys;
}

// Generate a template for missing translations
function generateMissingTranslationsTemplate() {
  const missing = findMissingTranslations();
  
  Object.keys(missing).forEach(lang => {
    Object.keys(missing[lang]).forEach(namespace => {
      const enTranslations = readTranslationFile('en', namespace);
      const langTranslations = readTranslationFile(lang, namespace);
      
      // Add missing keys with English values as placeholders
      missing[lang][namespace].forEach(key => {
        const keys = key.split('.');
        let current = langTranslations;
        let enCurrent = enTranslations;
        
        // Navigate to the correct nesting level
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
          enCurrent = enCurrent[keys[i]];
        }
        
        // Add the missing key with the English value
        const lastKey = keys[keys.length - 1];
        current[lastKey] = `[MISSING] ${enCurrent[lastKey]}`;
      });
      
      // Write the updated translations back to the file
      writeTranslationFile(lang, namespace, langTranslations);
    });
  });
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'find-missing':
      const missing = findMissingTranslations();
      console.log('Missing translations:');
      console.log(JSON.stringify(missing, null, 2));
      break;
    case 'generate-template':
      generateMissingTranslationsTemplate();
      break;
    default:
      console.log('Available commands:');
      console.log('  find-missing - Find missing translations');
      console.log('  generate-template - Generate template for missing translations');
      break;
  }
}

main();
