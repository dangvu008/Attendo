# Hướng dẫn sử dụng hệ thống đa ngôn ngữ tùy chỉnh

## Giới thiệu

Hệ thống đa ngôn ngữ tùy chỉnh này được tạo ra để thay thế i18next và Trans component, giúp ứng dụng hoạt động tốt hơn trên Snack.expo.dev.

## Cách sử dụng

### Bước 1: Sử dụng SimpleLocalizationApp

Cách đơn giản nhất để kiểm tra là sử dụng SimpleLocalizationApp:

1. Mở file `App.js`
2. Thay thế nội dung bằng:

```javascript
import SimpleLocalizationApp from './examples/SimpleLocalizationApp';
export default SimpleLocalizationApp;
```

### Bước 2: Tích hợp vào dự án chính

Nếu bạn muốn tích hợp vào dự án chính, hãy thực hiện các bước sau:

1. Thêm LocalizationProvider vào App.js:

```javascript
import { LocalizationProvider } from './localization';

// Trong component App
return (
  <ThemeProvider>
    <LocalizationProvider>
      <AppProvider>
        {/* Nội dung ứng dụng */}
      </AppProvider>
    </LocalizationProvider>
  </ThemeProvider>
);
```

2. Thay thế useTranslation bằng useLocalization:

```javascript
// Thay thế
import { useTranslation } from "../i18n/useTranslation";

// Bằng
import { useLocalization } from "../localization";
```

3. Thay thế Trans component bằng LocalizedText hoặc RichLocalizedText:

```javascript
// Thay thế
import Trans from "../i18n/Trans";
<Trans i18nKey="home.welcomeMessage">
  Welcome to <Text style={styles.highlight}>Workly</Text>, your personal shift management app!
</Trans>

// Bằng
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

4. Sử dụng LocalizedText cho văn bản đơn giản:

```javascript
import { LocalizedText } from "../localization";

<LocalizedText textKey="todayShifts" style={styles.sectionTitle} />
```

5. Sử dụng t() cho văn bản với tham số:

```javascript
const { t } = useLocalization();

<Text>{t('workingFor', { duration: '2h 30m' })}</Text>
```

## Các component và hook

### 1. useLocalization

Hook cơ bản để sử dụng đa ngôn ngữ:

```javascript
const { t, changeLanguage, getCurrentLanguage, isLoaded } = useLocalization();
```

### 2. LocalizedText

Component để hiển thị văn bản đơn giản:

```javascript
<LocalizedText textKey="appName" style={styles.title} />
```

### 3. RichLocalizedText

Component để hiển thị văn bản phức tạp với các thành phần con:

```javascript
<RichLocalizedText 
  textKey="welcomeMessage"
  components={[
    { tag: 'app', component: <Text style={styles.highlight}>Workly</Text> }
  ]}
/>
```

### 4. LocalizationProvider

Provider để quản lý ngôn ngữ trong toàn bộ ứng dụng:

```javascript
<LocalizationProvider>
  {/* Nội dung ứng dụng */}
</LocalizationProvider>
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
