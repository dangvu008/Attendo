import i18next from 'i18next';
import { initI18n, loadLanguageNamespaces } from '../i18n';
import enCommon from '../translations/en/common';
import viCommon from '../translations/vi/common';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(JSON.stringify({ language: 'en' }))),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock dynamic imports
jest.mock('../translations/en/home', () => ({ default: { key: 'value' } }), { virtual: true });
jest.mock('../translations/vi/home', () => ({ default: { key: 'giá trị' } }), { virtual: true });

describe('i18n initialization', () => {
  beforeEach(() => {
    // Reset i18next instance before each test
    i18next.removeResourceBundle('en', 'common');
    i18next.removeResourceBundle('vi', 'common');
    i18next.removeResourceBundle('en', 'home');
    i18next.removeResourceBundle('vi', 'home');
  });

  it('should initialize with common namespace', async () => {
    const i18n = await initI18n();
    
    // Check if common namespace is loaded
    expect(i18n.hasResourceBundle('en', 'common')).toBe(true);
    expect(i18n.getResourceBundle('en', 'common')).toEqual(enCommon);
    
    // Check if default language is set correctly
    expect(i18n.language).toBe('en');
  });

  it('should load additional namespaces on demand', async () => {
    const i18n = await initI18n();
    
    // Initially, home namespace should not be loaded
    expect(i18n.hasResourceBundle('en', 'home')).toBe(false);
    
    // Load home namespace
    await loadLanguageNamespaces('en');
    
    // Now home namespace should be loaded
    expect(i18n.hasResourceBundle('en', 'home')).toBe(true);
    expect(i18n.getResourceBundle('en', 'home')).toEqual({ key: 'value' });
  });

  it('should change language and load resources', async () => {
    const i18n = await initI18n();
    
    // Change language to Vietnamese
    await i18n.changeLanguage('vi');
    
    // Check if language is changed
    expect(i18n.language).toBe('vi');
    
    // Check if common namespace is loaded for Vietnamese
    expect(i18n.hasResourceBundle('vi', 'common')).toBe(true);
    expect(i18n.getResourceBundle('vi', 'common')).toEqual(viCommon);
    
    // Load home namespace for Vietnamese
    await loadLanguageNamespaces('vi');
    
    // Check if home namespace is loaded for Vietnamese
    expect(i18n.hasResourceBundle('vi', 'home')).toBe(true);
    expect(i18n.getResourceBundle('vi', 'home')).toEqual({ key: 'giá trị' });
  });
});

describe('i18n translation', () => {
  beforeEach(async () => {
    // Initialize i18next before each test
    await initI18n();
  });

  it('should translate keys correctly', () => {
    // Test translation of common keys
    expect(i18next.t('common.appName')).toBe('Workly');
    expect(i18next.t('common.save')).toBe('Save');
  });

  it('should handle missing translations', () => {
    // Test fallback behavior for missing keys
    expect(i18next.t('common.nonExistentKey')).toBe('nonExistentKey');
  });

  it('should handle interpolation', () => {
    // Add a test resource with interpolation
    i18next.addResourceBundle('en', 'test', {
      welcome: 'Welcome, {{name}}!',
    });
    
    // Test interpolation
    expect(i18next.t('test.welcome', { name: 'John' })).toBe('Welcome, John!');
  });
});
