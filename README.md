# Smart Translator

## Giới thiệu

Project này là một ứng dụng web dịch thuật và phân tích ngữ pháp được xây dựng bằng Next.js (React). Mục tiêu chính của dự án là:

- Dịch giữa tiếng Việt và tiếng Anh.
- Phát hiện ngôn ngữ nguồn tự động.
- Kiểm tra và sửa lỗi ngữ pháp cơ bản cho văn bản tiếng Anh.
- Hiển thị độ tin cậy của bản dịch.

## Cách hoạt động

### 1. Giao diện người dùng

Ứng dụng chính được render từ `app/page.tsx` và hiển thị component `TranslationTool` trong `components/translation-tool.tsx`.

Người dùng nhập văn bản vào ô, chọn ngôn ngữ nguồn (`auto`, `vi`, `en`) và ngôn ngữ đích (`vi`, `en`).

Khi nhấn nút phân tích, ứng dụng sẽ gọi API nội bộ:

- `/api/translate` để dịch và kiểm tra ngữ pháp.
- `/api/translation-grammar` để xử lý ngữ pháp và dịch tùy chọn.

### 2. Route API

Có hai route API chính:

- `app/api/translate/route.ts`
- `app/api/translation-grammar/route.ts`

Cả hai route đều nhận dữ liệu JSON gồm:

- `text`: Văn bản cần dịch.
- `sourceLanguage`: `auto`, `vi` hoặc `en`.
- `targetLanguage`: `vi` hoặc `en`.
- `level`: `A1-A2`, `B1-B2`, `C1-C2` (tùy chọn, chỉ dùng khi dịch sang tiếng Anh).

Route sẽ parse payload bằng `zod`, sau đó gọi hàm `runOfflineTranslation` từ `lib/translator.ts`.

### 3. Luồng xử lý dịch và ngữ pháp

Hàm chính là `runOfflineTranslation` trong `lib/translator.ts`.

Các bước xử lý:

1. Chuẩn hóa văn bản đầu vào.
2. Phát hiện ngôn ngữ nguồn với `detectLanguageWithConfidence`.
3. Nếu văn bản là tiếng Anh, thực hiện kiểm tra ngữ pháp cơ bản với `checkAndCorrectGrammar` từ `lib/grammar.ts`.
4. Dịch văn bản bằng hàm `translateWithGemini`:
   - Sử dụng Google Generative AI thông qua thư viện `@google/generative-ai`.
   - Yêu cầu API key trong biến môi trường `GEMINI_API_KEY`.
   - Thử nhiều prompt và nhiều model Gemini để tối ưu đầu ra.
5. Xử lý hậu kỳ bản dịch bằng `postProcess`, `enforceLanguagePurity`, `naturalizeText`.
6. Tính điểm độ tin cậy (`confidence`) dựa trên số lỗi ngữ pháp, các token không khớp và độ tin cậy phát hiện ngôn ngữ.

### 4. Kiểm tra ngữ pháp

`lib/grammar.ts` cung cấp chức năng:

- Phát hiện khoảng trắng thừa.
- Phát hiện từ lặp.
- Kiểm tra chữ hoa đầu câu và dấu câu kết thúc cho cả tiếng Anh và tiếng Việt.
- Kiểm tra một số lỗi ngữ pháp tiếng Anh như viết hoa "I" và chia động từ.

Kết quả trả về gồm:

- `correctedText`
- `grammarIssues`

## Công nghệ sử dụng

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components
- Google Generative AI (`@google/generative-ai`)
- Zod

## Cài đặt và chạy dự án

### Yêu cầu

- Node.js 20+ (hoặc tương thích với Next.js 16)
- `pnpm` (hoặc `npm` / `yarn` nếu muốn)
- Biến môi trường `GEMINI_API_KEY` để dịch với Gemini API

### 1. Cài đặt

Mở terminal tại thư mục dự án và chạy:

```bash
pnpm install
```

Nếu bạn không dùng pnpm, có thể dùng:

```bash
npm install
```

### 2. Thiết lập biến môi trường

Tạo file `.env.local` ở gốc dự án và thêm:

```env
GEMINI_API_KEY=your_api_key_here
```

Thay `your_api_key_here` bằng API key thực tế từ Google Generative AI.

### 3. Chạy ứng dụng ở chế độ phát triển

```bash
pnpm dev
```

Hoặc với npm:

```bash
npm run dev
```

Sau đó mở trình duyệt tại:

```
http://localhost:3000
```

### 4. Build production

```bash
pnpm build
pnpm start
```

Hoặc với npm:

```bash
npm run build
npm start
```

## Ghi chú

- Nếu `GEMINI_API_KEY` không tồn tại hoặc không hợp lệ, hàm dịch sẽ trả về bản dịch rỗng và ghi cảnh báo vào console.
- API nội bộ của dự án cố gắng trả về payload an toàn ngay cả khi input không hợp lệ.
- Thành phần UI chính là `components/translation-tool.tsx`, trong đó quản lý trạng thái, gọi API và hiển thị kết quả dịch.

---

`README.md` này mô tả hệ thống và hành vi của dự án. Nếu cần thêm phần hướng dẫn mở rộng hoặc tài liệu kỹ thuật cụ thể, mình có thể bổ sung tiếp.