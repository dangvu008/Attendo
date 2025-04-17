# Hướng dẫn sử dụng Trans trực tiếp từ react-i18next

## Giới thiệu

Khi chạy ứng dụng trên Snack.expo.dev, bạn có thể gặp lỗi với module Trans.js. Hướng dẫn này sẽ giúp bạn sử dụng Trans trực tiếp từ react-i18next thay vì thông qua một file trung gian.

## Cách sử dụng

### Bước 1: Sử dụng DirectTransApp

Cách đơn giản nhất để kiểm tra là sử dụng DirectTransApp:

1. Mở file `App.js`
2. Thay thế nội dung bằng:

```javascript
import DirectTransApp from './examples/DirectTransApp';
export default DirectTransApp;
```

### Bước 2: Sửa các component trong dự án chính

Nếu bạn muốn sửa dự án chính, hãy thực hiện các thay đổi sau trong mỗi file sử dụng Trans:

1. Thay đổi cách import Trans:

```javascript
// Thay thế
import Trans from "../i18n/Trans";

// Bằng
import { Trans } from "react-i18next";
```

2. Thay đổi cách import useTranslation:

```javascript
// Thay thế
import { useTranslation } from "../i18n/useTranslation";

// Bằng
import { useTranslation } from "../i18n/snack-useTranslation";
```

### Bước 3: Sửa App.js

Thay thế cách khởi tạo i18n trong App.js:

```javascript
// Thay thế
import { initI18n } from "./i18n/i18n";
// ...
await initI18n();

// Bằng
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/translations/en";
import vi from "./i18n/translations/vi";
// ...
// Khởi tạo i18next trực tiếp
i18next.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    en: en,
    vi: vi,
  },
  lng: "vi",
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});
```

## Các file đã tạo

1. **App-snack.js**: Phiên bản App.js đã được sửa để sử dụng i18next trực tiếp
2. **i18n/snack-useTranslation.js**: Hook useTranslation đơn giản hóa
3. **examples/DirectTransExample.js**: Component ví dụ sử dụng Trans trực tiếp
4. **examples/DirectTransApp.js**: App đơn giản để kiểm tra

## Lưu ý

1. Giải pháp này chỉ áp dụng cho Snack.expo.dev, không cần thiết cho môi trường phát triển thông thường.
2. Nếu bạn gặp lỗi khác, hãy kiểm tra console để xem thông báo lỗi chi tiết.
3. Đảm bảo rằng bạn đã import đúng các file translations.
