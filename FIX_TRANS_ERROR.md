# Hướng dẫn sửa lỗi Trans.js trên Snack.expo.dev

## Vấn đề

Khi chạy ứng dụng trên Snack.expo.dev, bạn gặp lỗi:

```
Unable to resolve module 'Trans.js'
Error: Unable to resolve module 'module://Trans.js.js'
```

Lỗi này xảy ra vì cách Snack.expo.dev xử lý các module và import.

## Giải pháp

Thay vì sử dụng file Trans.js riêng biệt, chúng ta sẽ import Trans trực tiếp từ react-i18next trong các component cần sử dụng.

### Bước 1: Sử dụng App-snack.js

1. Thay thế nội dung của App.js bằng nội dung của App-snack.js:

```javascript
// Mở App.js và thay thế toàn bộ nội dung bằng nội dung của App-snack.js
```

### Bước 2: Sửa các component sử dụng Trans

Trong mỗi component sử dụng Trans, thay đổi cách import:

```javascript
// Thay thế
import Trans from "../i18n/Trans";

// Bằng
import { Trans } from "react-i18next";
```

Ví dụ, trong TranslationExamples.js:

```javascript
// Thay thế
import Trans from "../i18n/Trans";

// Bằng
import { Trans } from "react-i18next";
```

### Bước 3: Sửa các component sử dụng useTranslation

Trong mỗi component sử dụng useTranslation, thay đổi cách import:

```javascript
// Thay thế
import { useTranslation } from "../i18n/useTranslation";

// Bằng
import { useTranslation } from "../i18n/snack-useTranslation";
```

### Bước 4: Kiểm tra ứng dụng

Sau khi thực hiện các thay đổi trên, ứng dụng sẽ hoạt động bình thường trên Snack.expo.dev.

## Lưu ý

1. Giải pháp này chỉ áp dụng cho Snack.expo.dev, không cần thiết cho môi trường phát triển thông thường.
2. Nếu bạn gặp lỗi khác, hãy kiểm tra console để xem thông báo lỗi chi tiết.
3. Nếu bạn muốn sử dụng các tính năng nâng cao của i18n, bạn có thể cần điều chỉnh thêm.
