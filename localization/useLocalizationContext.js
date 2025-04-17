import { useContext } from 'react';
import { LocalizationContext } from './LocalizationProvider';

// Hook để sử dụng LocalizationContext
export const useLocalizationContext = () => {
  const context = useContext(LocalizationContext);
  
  if (!context) {
    throw new Error('useLocalizationContext must be used within a LocalizationProvider');
  }
  
  return context;
};
