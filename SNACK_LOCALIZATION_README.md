# Hướng dẫn sử dụng hệ thống đa ngôn ngữ tùy chỉnh trên Snack.expo.dev

## Giới thiệu

Hệ thống đa ngôn ngữ tùy chỉnh này được tạo ra để thay thế i18next và Trans component, giúp ứng dụng hoạt động tốt hơn trên Snack.expo.dev.

## Các thay đổi đã thực hiện

1. **Thay thế hệ thống i18n**: Đã thay thế i18next bằng hệ thống đa ngôn ngữ tùy chỉnh
2. **Tối ưu hóa MultiButton**: Đã cập nhật MultiButton để sử dụng hệ thống đa ngôn ngữ mới
3. **Đơn giản hóa App.js**: Đã đơn giản hóa App.js để dễ dàng kiểm tra

## Cách sử dụng

### Cách 1: Sử dụng App.js hiện tại

App.js hiện tại đã được cập nhật để sử dụng hệ thống đa ngôn ngữ mới:

```javascript
import React from 'react';
import { LocalizationProvider } from './localization';
import TranslationExample from './components/TranslationExample-localized';

export default function App() {
  return (
    <LocalizationProvider>
      <TranslationExample />
    </LocalizationProvider>
  );
}
```

### Cách 2: Sử dụng các component đã được tối ưu hóa

Nếu bạn muốn sử dụng các component đã được tối ưu hóa:

```javascript
// Thay thế
import MultiButton from "./components/MultiButton";

// Bằng
import MultiButton from "./components/optimized/MultiButton";
```

### Cách 3: Sử dụng hệ thống đa ngôn ngữ mới trong component của bạn

```javascript
// Import useLocalization
import { useLocalization } from "../localization";

// Trong component
const { t, changeLanguage, getCurrentLanguage } = useLocalization();

// Sử dụng t() để dịch văn bản
<Text>{t('appName')}</Text>

// Sử dụng LocalizedText
import { LocalizedText } from "../localization";
<LocalizedText textKey="todayShifts" style={styles.title} />

// Sử dụng RichLocalizedText
import { RichLocalizedText } from "../localization";
<RichLocalizedText 
  textKey="welcomeMessage"
  components={[
    { 
      tag: 'app', 
      component: <Text style={styles.highlight}>Workly</Text> 
    }
  ]}
/>
```

## Cấu trúc thư mục

- **localization/languages.js**: Định nghĩa các chuỗi ngôn ngữ
- **localization/useLocalization.js**: Hook cơ bản
- **localization/LocalizedText.js**: Component văn bản đơn giản
- **localization/RichLocalizedText.js**: Component văn bản phức tạp
- **localization/LocalizationProvider.js**: Provider quản lý ngôn ngữ
- **localization/useLocalizationContext.js**: Hook để sử dụng context
- **localization/index.js**: Export tất cả

## Các file đã tạo

1. **components/TranslationExample-localized.js**: Component demo hệ thống đa ngôn ngữ
2. **components/optimized/MultiButton.js**: Phiên bản tối ưu hóa của MultiButton

## Lưu ý

1. Hệ thống này đơn giản hơn i18next nhưng vẫn đáp ứng được hầu hết các nhu cầu đa ngôn ngữ.
2. Để thêm ngôn ngữ mới, chỉ cần thêm vào file languages.js.
3. Hệ thống này hoạt động tốt trên Snack.expo.dev vì không phụ thuộc vào các module phức tạp.
