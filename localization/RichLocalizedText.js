import React from 'react';
import { Text, View } from 'react-native';
import { useLocalization } from './useLocalization';

// Component để hiển thị văn bản đa ngôn ngữ với định dạng phức tạp
const RichLocalizedText = ({ textKey, params = {}, components = [], style, ...props }) => {
  const { t } = useLocalization();
  
  if (!textKey) {
    return <Text style={style} {...props}>{props.children || ''}</Text>;
  }
  
  // Lấy văn bản đã dịch
  const translatedText = t(textKey, params);
  
  // Nếu không có components, hiển thị văn bản đơn giản
  if (!components || components.length === 0) {
    return <Text style={style} {...props}>{translatedText}</Text>;
  }
  
  // Xử lý văn bản có components
  // Ví dụ: "Welcome to <app>Workly</app>, your personal shift management app!"
  // components = [{ tag: 'app', component: <Text style={styles.appName}>Workly</Text> }]
  
  // Tách văn bản thành các phần
  const parts = [];
  let lastIndex = 0;
  
  // Tìm tất cả các tag trong văn bản
  components.forEach(({ tag, component }) => {
    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;
    
    let startIndex = translatedText.indexOf(openTag, lastIndex);
    while (startIndex !== -1) {
      // Thêm văn bản trước tag
      if (startIndex > lastIndex) {
        parts.push({
          type: 'text',
          content: translatedText.substring(lastIndex, startIndex),
        });
      }
      
      // Tìm vị trí đóng tag
      const contentStart = startIndex + openTag.length;
      const contentEnd = translatedText.indexOf(closeTag, contentStart);
      
      if (contentEnd === -1) {
        // Không tìm thấy tag đóng, thoát vòng lặp
        break;
      }
      
      // Thêm component với nội dung bên trong tag
      const content = translatedText.substring(contentStart, contentEnd);
      parts.push({
        type: 'component',
        tag,
        content,
        component,
      });
      
      // Cập nhật vị trí cuối cùng
      lastIndex = contentEnd + closeTag.length;
      
      // Tìm tag tiếp theo
      startIndex = translatedText.indexOf(openTag, lastIndex);
    }
  });
  
  // Thêm phần còn lại của văn bản
  if (lastIndex < translatedText.length) {
    parts.push({
      type: 'text',
      content: translatedText.substring(lastIndex),
    });
  }
  
  // Render các phần
  return (
    <Text style={style} {...props}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <Text key={index}>{part.content}</Text>;
        } else {
          const comp = components.find(c => c.tag === part.tag);
          if (comp && comp.render) {
            return comp.render(part.content, index);
          } else if (React.isValidElement(comp.component)) {
            return React.cloneElement(comp.component, { key: index }, part.content);
          } else {
            return <Text key={index}>{part.content}</Text>;
          }
        }
      })}
    </Text>
  );
};

export default RichLocalizedText;
