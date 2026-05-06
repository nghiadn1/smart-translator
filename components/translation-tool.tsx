'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type CefrLevel,
  type SourceLanguage,
  type TargetLanguage,
} from '@/lib/translator';
import type { GrammarIssue } from '@/lib/grammar';
import { filterGrammarIssuesByLanguage } from '@/lib/grammar';

type UiMessage = {
  type: 'info' | 'warning';
  text: string;
};

export default function TranslationTool() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [grammarCorrection, setGrammarCorrection] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<SourceLanguage>('auto');
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>('en');
  const [level, setLevel] = useState<CefrLevel>('B1-B2');
  const [detectedLanguage, setDetectedLanguage] = useState<'vi' | 'en' | null>(
    null
  );
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
  const [confidence, setConfidence] = useState(0);
  const [uiMessage, setUiMessage] = useState<UiMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  type ApiTranslateResponse = {
    success: boolean;
    translation: string;
    sourceLanguage: 'en' | 'vi';
    targetLanguage: 'en' | 'vi';
    grammar: GrammarIssue[];
    correctedText: string;
    confidence: number;
  };

  const handleAnalyze = async () => {
    const text = inputText.trim();
    if (!text) {
      setUiMessage({
        type: 'warning',
        text: 'Vui lòng nhập nội dung trước khi phân tích.',
      });
      return;
    }

    setIsLoading(true);
    setUiMessage(null);
    setOutputText('');
    setDetectedLanguage(null);
    setGrammarIssues([]);
    setConfidence(0);
    setGrammarCorrection('');
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage,
          level: targetLanguage === 'en' ? level : undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | ApiTranslateResponse
        | { message?: string }
        | null;
      if (!response.ok) {
        setOutputText('');
        setUiMessage({
          type: 'warning',
          text:
            payload && 'message' in payload && payload.message
              ? payload.message
              : `API response status ${response.status}.`,
        });
        return;
      }

      if (
        !payload ||
        typeof payload !== 'object' ||
        !('success' in payload) ||
        !('translation' in payload) ||
        typeof payload.translation !== 'string'
      ) {
        setUiMessage({
          type: 'warning',
          text: 'Dữ liệu phản hồi không hợp lệ.',
        });
        setOutputText('');
        return;
      }

      setOutputText(payload.translation || '');
      setDetectedLanguage(
        'sourceLanguage' in payload && (payload.sourceLanguage === 'en' || payload.sourceLanguage === 'vi')
          ? payload.sourceLanguage
          : null
      );
      const visibleIssues =
        'grammar' in payload && Array.isArray(payload.grammar) && payload.sourceLanguage
          ? filterGrammarIssuesByLanguage(payload.grammar, payload.sourceLanguage)
          : [];
      setGrammarIssues(visibleIssues);
      setGrammarCorrection(
        payload.sourceLanguage === 'en' &&
          payload.correctedText &&
          payload.correctedText !== inputText.trim()
          ? payload.correctedText
          : ''
      );
      setConfidence(typeof payload.confidence === 'number' ? payload.confidence : 0);
      setUiMessage({
        type: payload.translation ? 'info' : 'warning',
        text: payload.translation ? 'Dịch thành công.' : 'Translation unavailable',
      });
    } catch (error) {
      console.warn('[API Error]:', error);
      setOutputText('');
      setUiMessage({
        type: 'warning',
        text: 'Không thể kết nối API.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Hệ Thống Phân Tích Dịch Thuật
          </h1>
          <p className="text-gray-600">
            Dịch ngôn ngữ và sửa lỗi ngữ pháp một cách tự động
          </p>
        </div>

        {/* Main Container */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Language Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-gray-700 font-semibold">Ngôn ngữ nguồn</label>
              <Select
                value={sourceLanguage}
                onValueChange={(value) =>
                  setSourceLanguage(value as SourceLanguage)
                }
              >
                <SelectTrigger className="h-12 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Tự động</SelectItem>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">Tiếng Anh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-gray-700 font-semibold">Dịch</label>
              <Select
                value={targetLanguage}
                onValueChange={(value) =>
                  setTargetLanguage(value as TargetLanguage)
                }
              >
                <SelectTrigger className="h-12 border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">Tiếng Anh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {targetLanguage === 'en' && (
              <div className="space-y-2">
                <label className="text-gray-700 font-semibold">CEFR</label>
                <Select
                  value={level}
                  onValueChange={(value) => setLevel(value as CefrLevel)}
                >
                  <SelectTrigger className="h-12 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1-A2">A1-A2</SelectItem>
                    <SelectItem value="B1-B2">B1-B2</SelectItem>
                    <SelectItem value="C1-C2">C1-C2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {detectedLanguage && (
            <p className="text-sm text-gray-500">
              Ngôn ngữ phát hiện: {detectedLanguage === 'en' ? 'Tiếng Anh' : 'Tiếng Việt'}
            </p>
          )}
          {confidence > 0 && (
            <p className="text-sm text-gray-500">
              Độ tin cậy bản dịch: {confidence.toFixed(1)}%
            </p>
          )}

          {/* Textareas Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Textarea */}
            <div className="flex flex-col">
              <Textarea
                placeholder="Nhập văn bản cần phân tích..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 min-h-64 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Output Textarea */}
            <div className="flex flex-col">
              <Textarea
                placeholder=""
                value={outputText}
                readOnly
                className="flex-1 min-h-64 p-4 border-2 border-gray-200 rounded-lg resize-none bg-gray-50"
              />
            </div>
          </div>
          {uiMessage && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                uiMessage.type === 'warning'
                  ? 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-blue-300 bg-blue-50 text-blue-800'
              }`}
            >
              {uiMessage.text}
            </div>
          )}

          {grammarIssues.length > 0 && (
            <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <p className="font-semibold mb-2">Gợi ý ngữ pháp</p>
              <ul className="space-y-1">
                {grammarIssues.map((issue, index) => (
                  <li key={`${issue.type}-${index}`}>
                    • {issue.explanation} ({issue.original} → {issue.suggestion})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Grammar Correction (if available) */}
          {grammarCorrection && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Sửa lỗi ngữ pháp:
              </p>
              <p className="text-gray-700">{grammarCorrection}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !inputText.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-6 rounded-lg transition-colors"
          >
            {isLoading ? 'Đang xử lý...' : 'BẮT ĐẦU PHÂN TÍCH'}
          </Button>
        </div>
      </div>
    </div>
  );
}
