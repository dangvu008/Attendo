# Hướng dẫn sử dụng hệ thống đa ngôn ngữ tùy chỉnh trên Snack.expo.dev

## Cách 1: Sử dụng phiên bản đơn giản của App.js

Đây là cách nhanh nhất để kiểm tra hệ thống đa ngôn ngữ mới:

1. Mở file `App.js`
2. Thay thế toàn bộ nội dung bằng:

```javascript
import SimpleLocalizationApp from './examples/SimpleLocalizationApp';
export default SimpleLocalizationApp;
```

3. Lưu file và chạy ứng dụng

## Cách 2: Sử dụng phiên bản đầy đủ của App.js

Nếu bạn muốn giữ nguyên cấu trúc ứng dụng hiện tại:

1. Mở file `App.js`
2. Thay thế:
   ```javascript
   import { useTranslation } from "./i18n/useTranslation";
   ```
   bằng:
   ```javascript
   import { useLocalization } from "./localization";
   ```

3. Thay thế:
   ```javascript
   import { initI18n } from "./i18n/i18n";
   ```
   bằng:
   ```javascript
   import { LocalizationProvider } from "./localization";
   ```

4. Thay thế tất cả các dòng:
   ```javascript
   const { t } = useTranslation();
   ```
   bằng:
   ```javascript
   const { t } = useLocalization();
   ```

5. Thay thế:
   ```javascript
   await initI18n();
   ```
   bằng:
   ```javascript
   // No need to initialize i18n, LocalizationProvider handles it
   ```

6. Thêm LocalizationProvider vào cấu trúc component:
   ```javascript
   <ThemeProvider>
     <LocalizationProvider>
       <AppProvider>
         {/* Nội dung ứng dụng */}
       </AppProvider>
     </LocalizationProvider>
   </ThemeProvider>
   ```

## Cách 3: Sử dụng các component đã được cập nhật

Chúng tôi đã tạo các phiên bản mới của một số component sử dụng hệ thống đa ngôn ngữ mới:

1. `components/AlarmModal-localized.js`: Phiên bản mới của AlarmModal
2. `components/TranslationExample-localized.js`: Component ví dụ về đa ngôn ngữ
3. `screens/TranslationDemoScreen-localized.js`: Màn hình demo đa ngôn ngữ

Để sử dụng các component này, bạn có thể:

1. Thay thế các component cũ bằng các phiên bản mới
2. Hoặc import trực tiếp các phiên bản mới trong code của bạn

## Cách sử dụng hệ thống đa ngôn ngữ mới

### 1. Văn bản đơn giản

```javascript
import { useLocalization } from "../localization";

const MyComponent = () => {
  const { t } = useLocalization();
  
  return (
    <Text>{t('appName')}</Text>
  );
};
```

### 2. Văn bản với tham số

```javascript
<Text>{t('workingFor', { duration: '2h 30m' })}</Text>
```

### 3. Component LocalizedText

```javascript
import { LocalizedText } from "../localization";

<LocalizedText textKey="todayShifts" style={styles.title} />
```

### 4. Component RichLocalizedText

```javascript
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

### 5. Thay đổi ngôn ngữ

```javascript
const { changeLanguage } = useLocalization();

// Thay đổi ngôn ngữ sang tiếng Anh
changeLanguage('en');

// Thay đổi ngôn ngữ sang tiếng Việt
changeLanguage('vi');
```

## Thêm ngôn ngữ mới

Để thêm ngôn ngữ mới, bạn cần cập nhật file `localization/languages.js`:

1. Thêm một key mới cho ngôn ngữ của bạn
2. Thêm tất cả các chuỗi dịch cho ngôn ngữ đó

Ví dụ:

```javascript
export const languages = {
  vi: {
    // Vietnamese translations
  },
  en: {
    // English translations
  },
  fr: {
    // French translations
    appName: "Workly",
    save: "Enregistrer",
    cancel: "Annuler",
    // ... thêm các chuỗi khác
  }
};
```

## Lưu ý

1. Hệ thống đa ngôn ngữ mới hoạt động tốt trên Snack.expo.dev vì không phụ thuộc vào các module phức tạp
2. Các chuỗi dịch được lưu trữ trực tiếp trong code, không cần tải từ file bên ngoài
3. Hệ thống này đơn giản hơn i18next nhưng vẫn đáp ứng được hầu hết các nhu cầu đa ngôn ngữ
