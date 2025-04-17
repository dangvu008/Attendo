# Hướng dẫn sử dụng hệ thống đa ngôn ngữ tùy chỉnh trên Snack.expo.dev

## Vấn đề đã gặp và giải pháp

Khi chạy ứng dụng trên Snack.expo.dev, bạn đã gặp các vấn đề sau:

1. **Lỗi không tìm thấy file ShiftsScreen**: Đã sửa bằng cách thay thế import bằng ShiftListScreen
2. **Lỗi ESLint trong MultiButton.js**: Đã sử dụng phiên bản tối ưu hóa trong thư mục components/optimized
3. **Lỗi duplicate key trong languages.js**: Đã sửa bằng cách loại bỏ các key trùng lặp
4. **Lỗi ESLint trong SimpleI18nTest.js**: Đã sửa bằng cách thêm dependency cho useEffect

## Cách sử dụng

### Cách 1: Sử dụng App-final.js

Cách đơn giản nhất để kiểm tra hệ thống đa ngôn ngữ mới:

1. Mở file `App.js`
2. Thay thế toàn bộ nội dung bằng nội dung của file `App-final.js`:

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

Chúng tôi đã tạo các phiên bản tối ưu hóa của các component:

1. `components/optimized/MultiButton.js`: Phiên bản tối ưu hóa của MultiButton
2. `components/TranslationExample-localized.js`: Component demo hệ thống đa ngôn ngữ
3. `screens/TranslationDemoScreen-localized.js`: Màn hình demo hệ thống đa ngôn ngữ

Để sử dụng các component này, bạn có thể:

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

1. **App-final.js**: Phiên bản đơn giản của App.js để kiểm tra
2. **components/TranslationExample-localized.js**: Component demo hệ thống đa ngôn ngữ
3. **screens/TranslationDemoScreen-localized.js**: Màn hình demo hệ thống đa ngôn ngữ
4. **components/optimized/MultiButton.js**: Phiên bản tối ưu hóa của MultiButton

## Lưu ý

1. Hệ thống này đơn giản hơn i18next nhưng vẫn đáp ứng được hầu hết các nhu cầu đa ngôn ngữ.
2. Để thêm ngôn ngữ mới, chỉ cần thêm vào file languages.js.
3. Hệ thống này hoạt động tốt trên Snack.expo.dev vì không phụ thuộc vào các module phức tạp.
