# Hướng dẫn chạy ứng dụng trên Snack.expo.dev

## Vấn đề đã gặp và giải pháp

Khi chạy ứng dụng trên Snack.expo.dev, bạn đã gặp một số vấn đề:

1. **Lỗi module Node.js**: Snack không hỗ trợ các module Node.js như `child_process`, `fs`, `path`
2. **Lỗi ESLint**: Các cảnh báo về dependencies trong useEffect
3. **Lỗi Trans.js**: Không thể resolve module 'Trans.js'

Chúng tôi đã giải quyết các vấn đề này bằng cách:

1. Loại bỏ các file sử dụng module Node.js
2. Tắt cảnh báo ESLint trong các component animation
3. Đơn giản hóa hệ thống i18n

## Cách chạy ứng dụng

### Phương pháp 1: Sử dụng SimpleApp

Cách đơn giản nhất để kiểm tra ứng dụng là sử dụng SimpleApp:

1. Mở file `App.js`
2. Thay thế nội dung bằng:

```javascript
import SimpleApp from './examples/SimpleApp';
export default SimpleApp;
```

### Phương pháp 2: Sửa App.js hiện tại

Nếu bạn muốn giữ nguyên App.js hiện tại, hãy thực hiện các thay đổi sau:

1. Thay thế import i18n:

```javascript
// Thay thế
import { initI18n } from "./i18n/i18n";
// Bằng
import { initLanguage } from "./i18n/simple-i18n";
```

2. Thay thế cách khởi tạo i18n:

```javascript
// Thay thế
await initI18n();
// Bằng
await initLanguage();
```

3. Thay thế import Trans và useTranslation:

```javascript
// Thay thế
import { useTranslation } from "./i18n/useTranslation";
import Trans from "./i18n/Trans";
// Bằng
import { useTranslation } from "./i18n/simple-useTranslation";
import Trans from "./i18n/simple-Trans";
```

## Kiểm tra i18n

Để kiểm tra hệ thống i18n, bạn có thể sử dụng component SimpleI18nTest:

```javascript
import SimpleI18nTest from './examples/SimpleI18nTest';

// Trong một màn hình nào đó
<SimpleI18nTest />
```

## Sử dụng MultiButton đã tối ưu hóa

Chúng tôi đã tạo một phiên bản tối ưu hóa của MultiButton để giải quyết các lỗi ESLint:

```javascript
// Thay thế
import MultiButton from "./components/MultiButton";
// Bằng
import MultiButton from "./components/optimized/MultiButton";
```

## Lưu ý quan trọng

1. Phiên bản đơn giản hóa của i18n không hỗ trợ lazy loading
2. Các file trong thư mục `i18n/tools` và `scripts` đã bị loại bỏ vì sử dụng module Node.js
3. Các cảnh báo ESLint đã được tắt bằng cách thêm `// eslint-disable-next-line react-hooks/exhaustive-deps`

## Kiểm tra

Sau khi áp dụng các thay đổi, hãy kiểm tra:

1. Ứng dụng khởi động thành công
2. Các translations hoạt động đúng
3. Chức năng chuyển đổi ngôn ngữ hoạt động đúng
