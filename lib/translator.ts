// Created by Cursor
import { GoogleGenerativeAI } from '@google/generative-ai';
import { type Language } from '@/lib/dictionary';
import { checkAndCorrectGrammar, type GrammarIssue } from '@/lib/grammar';

export type SourceLanguage = 'auto' | 'vi' | 'en';
export type TargetLanguage = 'vi' | 'en';
export type CefrLevel = 'A1-A2' | 'B1-B2' | 'C1-C2';

export type TranslationResponse = {
    success: true;
    sourceLanguage: Language;
    targetLanguage: TargetLanguage;
    originalText: string;
    translatedText: string;
    correctedText: string;
    grammarIssues: GrammarIssue[];
    confidence: number;
    message: string;
};

const VI_FLUENCY_REWRITE_RULES: Array<{ from: RegExp; to: string }> = [
    { from: /\bgiúp bạn với\b/gi, to: 'giúp bạn' },
    { from: /\bcó thể giúp\b/gi, to: 'có thể giúp' },
    { from: /\bvới\b(?=\s+(việc|điều|này|đó))/gi, to: '' },
    { from: /\s{2,}/g, to: ' ' },
];

const EN_FLUENCY_REWRITE_RULES: Array<{ from: RegExp; to: string }> = [
    { from: /\bhelp you by\b/gi, to: 'help you with' },
    { from: /\bhelp you to\b/gi, to: 'help you with' },
    { from: /\bstep next\b/gi, to: 'next step' },
    { from: /\bthe next step\b/gi, to: 'next step' },
    { from: /\bvery very\b/gi, to: 'very' },
    { from: /\s{2,}/g, to: ' ' },
];

const GEMINI_MODEL_CANDIDATE_HINTS = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
];
let cachedAvailableModels: string[] | null = null;

function hasVietnameseChars(text: string): boolean {
    return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
        text
    );
}

function detectLanguageWithConfidence(text: string): { language: Language; confidence: number } {
    if (!text.trim()) {
        return { language: 'en', confidence: 55 };
    }
    if (hasVietnameseChars(text)) {
        return { language: 'vi', confidence: 98 };
    }

    const viHints = ['tôi', 'bạn', 'chúng', 'và', 'là', 'không', 'được'];
    const enHints = ['i', 'you', 'we', 'and', 'is', 'not', 'are'];
    const lower = text.toLowerCase();
    let viScore = 0;
    let enScore = 0;
    for (const hint of viHints) {
        if (lower.includes(hint)) {
            viScore += 1;
        }
    }
    for (const hint of enHints) {
        if (lower.includes(` ${hint} `) || lower.startsWith(`${hint} `)) {
            enScore += 1;
        }
    }
    const language = viScore > enScore ? 'vi' : 'en';
    const delta = Math.abs(viScore - enScore);
    const confidence = Math.max(55, Math.min(95, 65 + delta * 10));
    return { language, confidence };
}

export function detectLanguage(text: string): Language {
    return detectLanguageWithConfidence(text).language;
}

function normalizeText(text: string): string {
    return text.replace(/\r\n/g, '\n').trim();
}

function tokenize(sentence: string): string[] {
    return sentence.match(/[A-Za-zÀ-ỹà-ỹĐđ0-9]+|[^\sA-Za-zÀ-ỹà-ỹĐđ0-9]+|\s+/g) ?? [];
}

function isWord(token: string): boolean {
    return /^[A-Za-zÀ-ỹà-ỹĐđ0-9]+$/.test(token);
}

type TranslationStats = {
    unknownWords: number;
    totalWords: number;
};

function postProcess(text: string, targetLanguage: TargetLanguage): string {
    let result = text
        .replace(/\s{2,}/g, ' ')
        .replace(/\s+([,.!?;:])/g, '$1')
        .trim();
    if (targetLanguage === 'vi') {
        result = result.replace(/\b(a|an|the)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
    }
    return result;
}

function enforceLanguagePurity(text: string): string {
    return text.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
}

function naturalizeText(text: string, targetLanguage: TargetLanguage): string {
    let result = text;
    const rules =
        targetLanguage === 'vi' ? VI_FLUENCY_REWRITE_RULES : EN_FLUENCY_REWRITE_RULES;
    for (const rule of rules) {
        result = result.replace(rule.from, rule.to);
    }
    result = result.replace(/\s{2,}/g, ' ').replace(/\s+([,.!?;:])/g, '$1').trim();
    return result;
}

function lightValidateTranslation(text: string): string[] {
    const warnings: string[] = [];
    if (/\[translated\]/i.test(text)) {
        warnings.push('placeholder-like token detected');
    }
    if (/\s{2,}/.test(text)) {
        warnings.push('extra whitespace detected');
    }
    return warnings;
}

function getLanguageCode(language: Language | SourceLanguage | TargetLanguage): string {
    return language === 'vi' ? 'Vietnamese' : 'English';
}

function looksLikeTargetLanguage(text: string, targetLang: TargetLanguage): boolean {
    if (!text.trim()) {
        return true;
    }
    const hasVi = hasVietnameseChars(text);
    if (targetLang === 'vi') {
        return hasVi || /\b(và|là|không|được|của|trong)\b/i.test(text);
    }
    return !hasVi;
}

function countUnknownLikeTokens(input: string, output: string): number {
    const inputWords = tokenize(input)
        .filter(isWord)
        .map((w) => w.toLowerCase());
    const outputWords = new Set(
        tokenize(output)
            .filter(isWord)
            .map((w) => w.toLowerCase())
    );
    return inputWords.filter((word) => outputWords.has(word)).length;
}

function calculateConfidence(params: {
    grammarIssueCount: number;
    unknownTokenCount: number;
    totalWords: number;
    detectionConfidence: number;
}): number {
    const total = Math.max(params.totalWords, 1);
    const grammarPenalty = Math.min(20, params.grammarIssueCount * 3);
    const unknownPenalty = Math.min(25, (params.unknownTokenCount / total) * 100 * 0.5);
    const detectionBoost = (params.detectionConfidence - 50) * 0.2;
    let confidence = 85 - grammarPenalty - unknownPenalty + detectionBoost;
    confidence = Math.max(0, Math.min(100, confidence));
    return Number(confidence.toFixed(1));
}

function sanitizeGeminiOutput(raw: string): string {
    return raw
        .replace(/```[\s\S]*?```/g, '')
        .replace(/^translation\s*:\s*/i, '')
        .replace(/^\s*["']|["']\s*$/g, '')
        .replace(/\[translated\]/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
}

function normalizeComparableText(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatus(error: unknown): number | undefined {
    if (!error || typeof error !== 'object') {
        return undefined;
    }
    const maybeStatus = (error as { status?: unknown }).status;
    return typeof maybeStatus === 'number' ? maybeStatus : undefined;
}

async function discoverAvailableModels(apiKey: string): Promise<string[]> {
    if (cachedAvailableModels) {
        return cachedAvailableModels;
    }
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        if (!response.ok) {
            console.warn(
                `[Translator Warning]: List models failed with status ${response.status}`
            );
            cachedAvailableModels = [...GEMINI_MODEL_CANDIDATE_HINTS];
            return cachedAvailableModels;
        }
        const payload = (await response.json()) as {
            models?: Array<{
                name?: string;
                supportedGenerationMethods?: string[];
            }>;
        };
        const modelNames = (payload.models ?? [])
            .filter((model) =>
                (model.supportedGenerationMethods ?? []).includes('generateContent')
            )
            .map((model) => (model.name ?? '').replace(/^models\//, ''))
            .filter((name) => name.startsWith('gemini-'));

        const preferred = GEMINI_MODEL_CANDIDATE_HINTS.filter((hint) =>
            modelNames.includes(hint)
        );
        const fallback = modelNames.filter((name) => !preferred.includes(name));
        cachedAvailableModels = [...preferred, ...fallback];
        if (cachedAvailableModels.length === 0) {
            cachedAvailableModels = [...GEMINI_MODEL_CANDIDATE_HINTS];
        }
        return cachedAvailableModels;
    } catch (error) {
        console.warn('[Translator Warning]: Failed to discover Gemini models', error);
        cachedAvailableModels = [...GEMINI_MODEL_CANDIDATE_HINTS];
        return cachedAvailableModels;
    }
}

function isExactPromptEcho(output: string, prompt: string): boolean {
    if (!output.trim() || !prompt.trim()) {
        return false;
    }
    return normalizeComparableText(output) === normalizeComparableText(prompt);
}

function isInputEcho(input: string, output: string): boolean {
    if (!input.trim() || !output.trim()) {
        return false;
    }
    return normalizeComparableText(input) === normalizeComparableText(output);
}

function finalizeTranslationOutput(
    input: string,
    output: string,
    sourceLang: Language,
    targetLang: TargetLanguage
): string {
    void targetLang;
    const cleaned = sanitizeGeminiOutput(output);
    if (!cleaned) {
        return '';
    }
    if (sourceLang !== targetLang && isInputEcho(input, cleaned)) {
        return '';
    }
    return cleaned;
}

export async function translateWithGemini(
    input: string,
    sourceLang: Language,
    targetLang: TargetLanguage
): Promise<string> {
    if (!input.trim() || sourceLang === targetLang) {
        return input.trim();
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('[Translator Warning]: Missing GEMINI_API_KEY, returning empty translation');
        return '';
    }

    try {
        const client = new GoogleGenerativeAI(apiKey);
        const availableModels = await discoverAvailableModels(apiKey);
        const basePrompt = `You are a translation engine.

CRITICAL RULES:
- Output ONLY translated text
- Do NOT repeat input
- Do NOT explain
- Do NOT include instructions
- Do NOT add formatting or metadata
- Use only ${getLanguageCode(targetLang)}

Translate the text below:
"""
${input}
"""`;
        const strictPrompt = `${basePrompt}

Important:
- The output must be entirely in ${getLanguageCode(targetLang)}
- Do not keep source-language words unless they are proper nouns
- If uncertain, return an empty string`;
        const recoveryPrompt = `Translate this text to ${getLanguageCode(targetLang)}. Return only the translation.
Text: ${input}`;

        for (const modelName of availableModels) {
            try {
                const model = client.getGenerativeModel({ model: modelName });
                const firstTry = await model.generateContent(basePrompt);
                const firstResponse = await firstTry.response;
                const firstRaw = firstResponse.text() ?? '';
                if (!isExactPromptEcho(firstRaw, basePrompt)) {
                    const firstText = finalizeTranslationOutput(
                        input,
                        firstRaw,
                        sourceLang,
                        targetLang
                    );
                    if (firstText) {
                        return firstText;
                    }
                }

                const secondTry = await model.generateContent(strictPrompt);
                const secondResponse = await secondTry.response;
                const secondRaw = secondResponse.text() ?? '';
                if (!isExactPromptEcho(secondRaw, strictPrompt)) {
                    const secondText = finalizeTranslationOutput(
                        input,
                        secondRaw,
                        sourceLang,
                        targetLang
                    );
                    if (secondText) {
                        return secondText;
                    }
                }

                const thirdTry = await model.generateContent(recoveryPrompt);
                const thirdResponse = await thirdTry.response;
                const thirdRaw = thirdResponse.text() ?? '';
                if (!isExactPromptEcho(thirdRaw, recoveryPrompt)) {
                    const thirdText = finalizeTranslationOutput(
                        input,
                        thirdRaw,
                        sourceLang,
                        targetLang
                    );
                    if (thirdText) {
                        return thirdText;
                    }
                }
            } catch (modelError) {
                const status = getErrorStatus(modelError);
                if (status === 429) {
                    console.warn(
                        `[Translator Warning]: Model ${modelName} hit quota, retrying once...`
                    );
                    await sleep(1500);
                    try {
                        const retryModel = client.getGenerativeModel({ model: modelName });
                        const retryTry = await retryModel.generateContent(recoveryPrompt);
                        const retryResp = await retryTry.response;
                        const retryRaw = retryResp.text() ?? '';
                        if (!isExactPromptEcho(retryRaw, recoveryPrompt)) {
                            const retryText = finalizeTranslationOutput(
                                input,
                                retryRaw,
                                sourceLang,
                                targetLang
                            );
                            if (retryText) {
                                return retryText;
                            }
                        }
                    } catch (retryError) {
                        console.warn(
                            `[Translator Warning]: Model ${modelName} retry failed`,
                            retryError
                        );
                    }
                }
                console.warn(`[Translator Warning]: Model ${modelName} failed`, modelError);
            }
        }
        return '';
    } catch (error) {
        console.warn('[Translator Warning]: Gemini translation failed', error);
        return '';
    }
}

export async function runOfflineTranslation(params: {
    text: string;
    sourceLanguage: SourceLanguage;
    targetLanguage: TargetLanguage;
    level?: CefrLevel;
}): Promise<TranslationResponse> {
    const cleanText = normalizeText(params.text ?? '');
    const detected = detectLanguageWithConfidence(cleanText);
    const sourceLanguage = detected.language;
    const effectiveTargetLanguage: TargetLanguage = sourceLanguage === 'en' ? 'vi' : 'en';

    const inputGrammar =
        sourceLanguage === 'en'
            ? checkAndCorrectGrammar(cleanText, 'en')
            : { correctedText: cleanText, grammarIssues: [] };
    const textForTranslation =
        sourceLanguage === 'en' ? inputGrammar.correctedText : cleanText;

    let translatedText = await translateWithGemini(
        textForTranslation,
        sourceLanguage,
        effectiveTargetLanguage
    );
    translatedText = postProcess(translatedText, effectiveTargetLanguage);

    translatedText = enforceLanguagePurity(translatedText);
    translatedText = naturalizeText(translatedText, effectiveTargetLanguage);
    translatedText = enforceLanguagePurity(translatedText);
    if (lightValidateTranslation(translatedText).length > 0) {
        console.warn('[Translator Warning]: Light validation detected formatting anomalies');
    }
    const grammar = inputGrammar;
    const totalWords = tokenize(translatedText).filter(isWord).length;
    const confidence = calculateConfidence({
        grammarIssueCount: grammar.grammarIssues.length,
        unknownTokenCount: countUnknownLikeTokens(cleanText, translatedText),
        totalWords,
        detectionConfidence:
            params.sourceLanguage === 'auto' ? detected.confidence : 90,
    });
    const levelMessage =
        effectiveTargetLanguage === 'en' && params.level
            ? ` CEFR level requested: ${params.level}.`
            : '';

    return {
        success: true,
        sourceLanguage,
        targetLanguage: effectiveTargetLanguage,
        originalText: cleanText,
        translatedText,
        correctedText: inputGrammar.correctedText,
        grammarIssues: inputGrammar.grammarIssues,
        confidence,
        message: `Translation completed with Gemini.${levelMessage}`,
    };
}

