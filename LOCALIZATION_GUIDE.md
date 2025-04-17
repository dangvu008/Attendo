# Hướng dẫn sử dụng hệ thống đa ngôn ngữ tùy chỉnh

## Cách 1: Kiểm tra nhanh với App-test.js

Để kiểm tra nhanh hệ thống đa ngôn ngữ mới:

1. Mở file `App.js`
2. Thay thế toàn bộ nội dung bằng nội dung của file `App-test.js`:

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

## Cách 2: Sử dụng các component đã được cập nhật

Chúng tôi đã cập nhật các component sau để sử dụng hệ thống đa ngôn ngữ mới:

1. `components/AlarmModal.js`: Đã được cập nhật để sử dụng useLocalization
2. `screens/TranslationDemoScreen.js`: Đã được cập nhật để sử dụng TranslationExample-localized
3. `components/TranslationExample-localized.js`: Component mới để demo hệ thống đa ngôn ngữ

Bạn có thể truy cập màn hình TranslationDemoScreen để xem demo của hệ thống đa ngôn ngữ mới.

## Cách sử dụng hệ thống đa ngôn ngữ mới trong component của bạn

### 1. Import useLocalization

```javascript
import { useLocalization } from '../localization';

const MyComponent = () => {
  const { t, changeLanguage, getCurrentLanguage } = useLocalization();
  
  // Sử dụng t() để dịch văn bản
  return <Text>{t('appName')}</Text>;
};
```

### 2. Sử dụng LocalizedText cho văn bản đơn giản

```javascript
import { LocalizedText } from '../localization';

// Trong component
<LocalizedText textKey="todayShifts" style={styles.title} />
```

### 3. Sử dụng RichLocalizedText cho văn bản phức tạp

```javascript
import { RichLocalizedText } from '../localization';

// Trong component
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

### 4. Sử dụng tham số trong văn bản

```javascript
// Với t()
<Text>{t('workingFor', { duration: '2h 30m' })}</Text>

// Với LocalizedText
<LocalizedText 
  textKey="weatherAlert" 
  params={{ temperature: 28, condition: 'Sunny' }}
/>
```

### 5. Thay đổi ngôn ngữ

```javascript
const { changeLanguage } = useLocalization();

// Thay đổi ngôn ngữ sang tiếng Anh
changeLanguage('en');

// Thay đổi ngôn ngữ sang tiếng Việt
changeLanguage('vi');
```

## Cấu trúc thư mục

- **localization/languages.js**: Định nghĩa các chuỗi ngôn ngữ
- **localization/useLocalization.js**: Hook cơ bản
- **localization/LocalizedText.js**: Component văn bản đơn giản
- **localization/RichLocalizedText.js**: Component văn bản phức tạp
- **localization/LocalizationProvider.js**: Provider quản lý ngôn ngữ
- **localization/useLocalizationContext.js**: Hook để sử dụng context
- **localization/index.js**: Export tất cả

## Lưu ý

1. Hệ thống này đơn giản hơn i18next nhưng vẫn đáp ứng được hầu hết các nhu cầu đa ngôn ngữ.
2. Để thêm ngôn ngữ mới, chỉ cần thêm vào file languages.js.
3. Hệ thống này hoạt động tốt trên Snack.expo.dev vì không phụ thuộc vào các module phức tạp.
