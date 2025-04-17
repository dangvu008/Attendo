import React from 'react';
import { Text } from 'react-native';

/**
 * Một phiên bản đơn giản của Trans component không phụ thuộc vào context
 * Được sử dụng trong các trường hợp không thể truy cập context
 */
const TransWithoutContext = ({ i18nKey, components = [], values = {}, style = {}, defaultText = '' }) => {
  // Trả về text mặc định hoặc i18nKey nếu không có text mặc định
  const content = defaultText || i18nKey || '';
  
  // Nếu không có components, trả về Text đơn giản
  if (!components || components.length === 0) {
    return <Text style={style}>{content}</Text>;
  }
  
  // Xử lý các component con
  let result = content;
  
  components.forEach(({ tag, component }) => {
    if (!tag || !component) return;
    
    // Tìm và thay thế các tag trong văn bản
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 'g');
    const matches = [...content.matchAll(regex)];
    
    if (matches.length > 0) {
      // Tạo mảng các phần của văn bản và component
      let parts = [];
      let lastIndex = 0;
      
      matches.forEach((match, index) => {
        // Thêm văn bản trước tag
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        
        // Thêm component với nội dung bên trong tag
        const innerContent = match[1];
        const clonedComponent = React.cloneElement(component, { key: `${tag}-${index}` }, innerContent);
        parts.push(clonedComponent);
        
        lastIndex = match.index + match[0].length;
      });
      
      // Thêm phần còn lại của văn bản
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }
      
      // Cập nhật kết quả
      result = parts;
    }
  });
  
  // Trả về Text chứa tất cả các phần
  return <Text style={style}>{result}</Text>;
};

export default TransWithoutContext;
