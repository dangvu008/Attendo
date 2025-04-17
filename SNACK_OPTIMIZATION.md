# Tối ưu hóa cho Snack.expo.dev

Tài liệu này hướng dẫn cách sử dụng phiên bản đơn giản hóa của hệ thống i18n cho Snack.expo.dev.

## Vấn đề với Snack.expo.dev

Snack.expo.dev có một số giới hạn và khác biệt so với môi trường phát triển thông thường:

1. Giới hạn về kích thước bundle
2. Khả năng tương thích với các module động
3. Xử lý đường dẫn file khác biệt

## Giải pháp đơn giản hóa

Chúng tôi đã tạo một phiên bản siêu đơn giản của hệ thống i18n để hoạt động tốt trên Snack.expo.dev:

### 1. Sử dụng phiên bản đơn giản của i18n

```javascript
// Thay thế
import i18next, { initI18n } from "./i18n/i18n";

// Bằng
import i18next, { initLanguage } from "./i18n/simple-i18n";
```

### 2. Sử dụng phiên bản đơn giản của useTranslation

```javascript
// Thay thế
import { useTranslation } from "./i18n/useTranslation";

// Bằng
import { useTranslation } from "./i18n/simple-useTranslation";
```

### 3. Sử dụng phiên bản đơn giản của Trans

```javascript
// Thay thế
import Trans from "./i18n/Trans";

// Bằng
import Trans from "./i18n/simple-Trans";
```

## Cách triển khai

### Bước 1: Cập nhật App.js

Thay đổi cách khởi tạo i18n trong App.js:

```javascript
// Thay thế
import { initI18n } from "./i18n/i18n";

// Trong useEffect
await initI18n();

// Bằng
import { initLanguage } from "./i18n/simple-i18n";

// Trong useEffect
await initLanguage();
```

### Bước 2: Cập nhật các import trong các component

Cập nhật tất cả các import liên quan đến i18n trong các component:

```javascript
// Thay thế
import { useTranslation } from "../i18n/useTranslation";
import Trans from "../i18n/Trans";

// Bằng
import { useTranslation } from "../i18n/simple-useTranslation";
import Trans from "../i18n/simple-Trans";
```

### Bước 3: Đơn giản hóa cấu trúc translations

Đảm bảo bạn đang sử dụng cấu trúc đơn giản cho translations:

```javascript
// Sử dụng
import en from "./translations/en";
import vi from "./translations/vi";

// Thay vì
import enCommon from "./translations/en/common";
import viCommon from "./translations/vi/common";
```

## Lưu ý quan trọng

1. Phiên bản đơn giản này không hỗ trợ lazy loading
2. Tất cả translations được tải cùng lúc khi khởi động ứng dụng
3. Nếu bạn có nhiều translations, hãy cân nhắc tách thành các module nhỏ hơn

## Kiểm tra

Sau khi áp dụng các thay đổi, hãy kiểm tra:

1. Ứng dụng khởi động thành công
2. Các translations hoạt động đúng
3. Chức năng chuyển đổi ngôn ngữ hoạt động đúng
