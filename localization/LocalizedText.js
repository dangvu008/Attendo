import React from 'react';
import { Text } from 'react-native';
import { useLocalization } from './useLocalization';

// Component đơn giản để hiển thị văn bản đa ngôn ngữ
const LocalizedText = ({ textKey, params = {}, style, children, ...props }) => {
  const { t } = useLocalization();
  
  // Nếu có textKey, sử dụng nó để dịch
  if (textKey) {
    return (
      <Text style={style} {...props}>
        {t(textKey, params)}
      </Text>
    );
  }
  
  // Nếu không có textKey, hiển thị children
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
};

export default LocalizedText;
