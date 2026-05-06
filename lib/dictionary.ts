// Created by Cursor

export type Language = 'en' | 'vi';

export type DictionaryEntry = {
    en: string;
    vi: string;
    category:
        | 'pronoun'
        | 'verb'
        | 'adjective'
        | 'noun'
        | 'technical'
        | 'connector'
        | 'education'
        | 'cefr'
        | 'phrase'
        | 'other';
};

const BASE_ENTRIES: DictionaryEntry[] = [
    // Pronouns
    { en: 'i', vi: 'tôi', category: 'pronoun' },
    { en: 'you', vi: 'bạn', category: 'pronoun' },
    { en: 'we', vi: 'chúng tôi', category: 'pronoun' },
    { en: 'they', vi: 'họ', category: 'pronoun' },
    { en: 'he', vi: 'anh ấy', category: 'pronoun' },
    { en: 'she', vi: 'cô ấy', category: 'pronoun' },
    { en: 'it', vi: 'nó', category: 'pronoun' },
    { en: 'me', vi: 'tôi', category: 'pronoun' },
    { en: 'us', vi: 'chúng tôi', category: 'pronoun' },
    { en: 'them', vi: 'họ', category: 'pronoun' },
    { en: 'my', vi: 'của tôi', category: 'pronoun' },
    { en: 'your', vi: 'của bạn', category: 'pronoun' },
    { en: 'our', vi: 'của chúng tôi', category: 'pronoun' },
    { en: 'their', vi: 'của họ', category: 'pronoun' },
    { en: 'his', vi: 'của anh ấy', category: 'pronoun' },
    { en: 'her', vi: 'của cô ấy', category: 'pronoun' },
    // Greetings and phrases
    { en: 'hello', vi: 'xin chào', category: 'phrase' },
    { en: 'hi', vi: 'xin chào', category: 'phrase' },
    { en: 'good morning', vi: 'chào buổi sáng', category: 'phrase' },
    { en: 'good afternoon', vi: 'chào buổi chiều', category: 'phrase' },
    { en: 'good evening', vi: 'chào buổi tối', category: 'phrase' },
    { en: 'good night', vi: 'chúc ngủ ngon', category: 'phrase' },
    { en: 'thank you', vi: 'cảm ơn', category: 'phrase' },
    { en: 'thanks a lot', vi: 'cảm ơn rất nhiều', category: 'phrase' },
    { en: 'you are welcome', vi: 'không có gì', category: 'phrase' },
    { en: 'excuse me', vi: 'xin lỗi', category: 'phrase' },
    { en: 'how are you', vi: 'bạn khỏe không', category: 'phrase' },
    { en: 'nice to meet you', vi: 'rất vui được gặp bạn', category: 'phrase' },
    { en: 'see you later', vi: 'hẹn gặp lại', category: 'phrase' },
    { en: 'would like to', vi: 'muốn', category: 'phrase' },
    { en: 'in order to', vi: 'để', category: 'phrase' },
    { en: 'as soon as possible', vi: 'càng sớm càng tốt', category: 'phrase' },
    { en: 'machine learning', vi: 'học máy', category: 'phrase' },
    { en: 'artificial intelligence', vi: 'trí tuệ nhân tạo', category: 'phrase' },
    { en: 'source code', vi: 'mã nguồn', category: 'phrase' },
    { en: 'user interface', vi: 'giao diện người dùng', category: 'phrase' },
    { en: 'software engineer', vi: 'kỹ sư phần mềm', category: 'phrase' },
    { en: 'best practice', vi: 'thực tiễn tốt', category: 'phrase' },
    { en: 'version control', vi: 'quản lý phiên bản', category: 'phrase' },
    // Verbs
    { en: 'go', vi: 'đi', category: 'verb' },
    { en: 'come', vi: 'đến', category: 'verb' },
    { en: 'want', vi: 'muốn', category: 'verb' },
    { en: 'need', vi: 'cần', category: 'verb' },
    { en: 'make', vi: 'tạo', category: 'verb' },
    { en: 'create', vi: 'tạo', category: 'verb' },
    { en: 'build', vi: 'xây dựng', category: 'verb' },
    { en: 'learn', vi: 'học', category: 'verb' },
    { en: 'study', vi: 'học', category: 'verb' },
    { en: 'work', vi: 'làm việc', category: 'verb' },
    { en: 'translate', vi: 'dịch', category: 'verb' },
    { en: 'analyze', vi: 'phân tích', category: 'verb' },
    { en: 'develop', vi: 'phát triển', category: 'verb' },
    { en: 'improve', vi: 'cải thiện', category: 'verb' },
    { en: 'fix', vi: 'sửa', category: 'verb' },
    { en: 'write', vi: 'viết', category: 'verb' },
    { en: 'read', vi: 'đọc', category: 'verb' },
    { en: 'understand', vi: 'hiểu', category: 'verb' },
    { en: 'run', vi: 'chạy', category: 'verb' },
    { en: 'test', vi: 'kiểm tra', category: 'verb' },
    { en: 'deploy', vi: 'triển khai', category: 'verb' },
    { en: 'support', vi: 'hỗ trợ', category: 'verb' },
    { en: 'connect', vi: 'kết nối', category: 'verb' },
    { en: 'process', vi: 'xử lý', category: 'verb' },
    // Adjectives
    { en: 'good', vi: 'tốt', category: 'adjective' },
    { en: 'great', vi: 'tuyệt vời', category: 'adjective' },
    { en: 'bad', vi: 'xấu', category: 'adjective' },
    { en: 'important', vi: 'quan trọng', category: 'adjective' },
    { en: 'useful', vi: 'hữu ích', category: 'adjective' },
    { en: 'simple', vi: 'đơn giản', category: 'adjective' },
    { en: 'difficult', vi: 'khó', category: 'adjective' },
    { en: 'fast', vi: 'nhanh', category: 'adjective' },
    { en: 'slow', vi: 'chậm', category: 'adjective' },
    { en: 'beautiful', vi: 'đẹp', category: 'adjective' },
    { en: 'clear', vi: 'rõ ràng', category: 'adjective' },
    { en: 'correct', vi: 'đúng', category: 'adjective' },
    { en: 'modern', vi: 'hiện đại', category: 'adjective' },
    { en: 'offline', vi: 'ngoại tuyến', category: 'adjective' },
    // Nouns
    { en: 'computer', vi: 'máy tính', category: 'noun' },
    { en: 'student', vi: 'học sinh', category: 'education' },
    { en: 'teacher', vi: 'giáo viên', category: 'education' },
    { en: 'project', vi: 'dự án', category: 'noun' },
    { en: 'software', vi: 'phần mềm', category: 'technical' },
    { en: 'language', vi: 'ngôn ngữ', category: 'noun' },
    { en: 'translation', vi: 'bản dịch', category: 'noun' },
    { en: 'grammar', vi: 'ngữ pháp', category: 'noun' },
    { en: 'university', vi: 'đại học', category: 'education' },
    { en: 'lesson', vi: 'bài học', category: 'education' },
    { en: 'document', vi: 'tài liệu', category: 'noun' },
    { en: 'code', vi: 'mã', category: 'technical' },
    { en: 'application', vi: 'ứng dụng', category: 'technical' },
    { en: 'sentence', vi: 'câu', category: 'noun' },
    { en: 'word', vi: 'chữ', category: 'noun' },
    { en: 'paragraph', vi: 'đoạn văn', category: 'noun' },
    { en: 'error', vi: 'lỗi', category: 'technical' },
    { en: 'result', vi: 'kết quả', category: 'noun' },
    // Technical
    { en: 'ai', vi: 'ai', category: 'technical' },
    { en: 'api', vi: 'api', category: 'technical' },
    { en: 'frontend', vi: 'frontend', category: 'technical' },
    { en: 'backend', vi: 'backend', category: 'technical' },
    { en: 'database', vi: 'cơ sở dữ liệu', category: 'technical' },
    { en: 'server', vi: 'máy chủ', category: 'technical' },
    { en: 'client', vi: 'máy khách', category: 'technical' },
    { en: 'component', vi: 'thành phần', category: 'technical' },
    { en: 'route', vi: 'tuyến', category: 'technical' },
    { en: 'typescript', vi: 'typescript', category: 'technical' },
    { en: 'react', vi: 'react', category: 'technical' },
    { en: 'next.js', vi: 'next.js', category: 'technical' },
    { en: 'cache', vi: 'bộ nhớ đệm', category: 'technical' },
    { en: 'algorithm', vi: 'thuật toán', category: 'technical' },
    { en: 'performance', vi: 'hiệu năng', category: 'technical' },
    // Connectors
    { en: 'and', vi: 'và', category: 'connector' },
    { en: 'or', vi: 'hoặc', category: 'connector' },
    { en: 'but', vi: 'nhưng', category: 'connector' },
    { en: 'if', vi: 'nếu', category: 'connector' },
    { en: 'because', vi: 'bởi vì', category: 'connector' },
    { en: 'however', vi: 'tuy nhiên', category: 'connector' },
    { en: 'therefore', vi: 'vì vậy', category: 'connector' },
    { en: 'although', vi: 'mặc dù', category: 'connector' },
    { en: 'when', vi: 'khi', category: 'connector' },
    { en: 'while', vi: 'trong khi', category: 'connector' },
    { en: 'before', vi: 'trước khi', category: 'connector' },
    { en: 'after', vi: 'sau khi', category: 'connector' },
    { en: 'then', vi: 'sau đó', category: 'connector' },
    // CEFR/common utility
    { en: 'today', vi: 'hôm nay', category: 'cefr' },
    { en: 'tomorrow', vi: 'ngày mai', category: 'cefr' },
    { en: 'yesterday', vi: 'hôm qua', category: 'cefr' },
    { en: 'people', vi: 'mọi người', category: 'cefr' },
    { en: 'family', vi: 'gia đình', category: 'cefr' },
    { en: 'friend', vi: 'bạn bè', category: 'cefr' },
    { en: 'home', vi: 'nhà', category: 'cefr' },
    { en: 'school', vi: 'trường học', category: 'cefr' },
    { en: 'class', vi: 'lớp học', category: 'cefr' },
    { en: 'book', vi: 'sách', category: 'cefr' },
    { en: 'problem', vi: 'vấn đề', category: 'cefr' },
    { en: 'solution', vi: 'giải pháp', category: 'cefr' },
    { en: 'question', vi: 'câu hỏi', category: 'cefr' },
    { en: 'answer', vi: 'câu trả lời', category: 'cefr' },
    { en: 'example', vi: 'ví dụ', category: 'cefr' },
    { en: 'information', vi: 'thông tin', category: 'cefr' },
    { en: 'message', vi: 'tin nhắn', category: 'cefr' },
    { en: 'feature', vi: 'tính năng', category: 'cefr' },
    { en: 'system', vi: 'hệ thống', category: 'cefr' },
];

function normalizeKey(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

const EN_TO_VI_MAP = new Map<string, string>();
const VI_TO_EN_MAP = new Map<string, string>();

for (const entry of BASE_ENTRIES) {
    EN_TO_VI_MAP.set(normalizeKey(entry.en), entry.vi);
    VI_TO_EN_MAP.set(normalizeKey(entry.vi), entry.en);
}

const EN_PHRASES = Array.from(EN_TO_VI_MAP.keys()).sort(
    (a, b) => b.split(' ').length - a.split(' ').length
);
const VI_PHRASES = Array.from(VI_TO_EN_MAP.keys()).sort(
    (a, b) => b.split(' ').length - a.split(' ').length
);

export function getDictionary(language: Language): Map<string, string> {
    return language === 'en' ? EN_TO_VI_MAP : VI_TO_EN_MAP;
}

export function getPhraseKeys(language: Language): string[] {
    return language === 'en' ? EN_PHRASES : VI_PHRASES;
}

export function getDictionarySize(): number {
    return BASE_ENTRIES.length;
}

