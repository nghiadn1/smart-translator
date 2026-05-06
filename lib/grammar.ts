import type { Language } from '@/lib/dictionary';

export type GrammarIssue = {
    type: string;
    original: string;
    suggestion: string;
    explanation: string;
};

type GrammarCheckResult = {
    correctedText: string;
    grammarIssues: GrammarIssue[];
};

function capitalizeFirst(text: string): string {
    if (!text) {
        return text;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function collectSharedIssues(text: string): GrammarIssue[] {
    const issues: GrammarIssue[] = [];

    if (/\s{2,}/.test(text)) {
        issues.push({
            type: 'spacing',
            original: text,
            suggestion: text.replace(/\s{2,}/g, ' '),
            explanation: 'Reduce repeated spaces.',
        });
    }

    if (/\b(\w+)\s+\1\b/i.test(text)) {
        issues.push({
            type: 'repeated_word',
            original: text,
            suggestion: text.replace(/\b(\w+)\s+\1\b/gi, '$1'),
            explanation: 'Repeated word detected.',
        });
    }

    return issues;
}

function collectEnglishIssues(text: string): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    const capitalized = capitalizeFirst(text.trim());
    if (capitalized !== text) {
        issues.push({
            type: 'capitalization',
            original: text,
            suggestion: capitalized,
            explanation: 'Sentence should start with a capital letter.',
        });
    }

    if (!/[.!?]$/.test(text.trim())) {
        issues.push({
            type: 'punctuation',
            original: text,
            suggestion: `${text.trim()}.`,
            explanation: 'Sentence should end with punctuation.',
        });
    }

    const fixedI = text.replace(/\bi\b/g, 'I');
    if (fixedI !== text) {
        issues.push({
            type: 'pronoun_case',
            original: text,
            suggestion: fixedI,
            explanation: 'English pronoun "I" must be uppercase.',
        });
    }

    if (/\b(he|she|it)\s+go\b/i.test(text)) {
        issues.push({
            type: 'subject_verb_agreement',
            original: text,
            suggestion: text.replace(/\b(he|she|it)\s+go\b/gi, '$1 goes'),
            explanation: 'Third-person singular should use verb + s.',
        });
    }

    return issues;
}

function collectVietnameseIssues(text: string): GrammarIssue[] {
    const issues: GrammarIssue[] = [];
    const capitalized = capitalizeFirst(text.trim());
    if (capitalized !== text) {
        issues.push({
            type: 'capitalization',
            original: text,
            suggestion: capitalized,
            explanation: 'Cau tieng Viet nen viet hoa chu cai dau.',
        });
    }

    if (!/[.!?]$/.test(text.trim())) {
        issues.push({
            type: 'punctuation',
            original: text,
            suggestion: `${text.trim()}.`,
            explanation: 'Cau tieng Viet nen ket thuc bang dau cau.',
        });
    }

    return issues;
}

export function checkAndCorrectGrammar(text: string, language: Language): GrammarCheckResult {
    const trimmed = text.trim();
    if (!trimmed) {
        return { correctedText: '', grammarIssues: [] };
    }

    const grammarIssues = [
        ...collectSharedIssues(trimmed),
        ...(language === 'en' ? collectEnglishIssues(trimmed) : collectVietnameseIssues(trimmed)),
    ];

    // Grammar module is analysis-only and never mutates translation output.
    return {
        correctedText: trimmed,
        grammarIssues,
    };
}

export function filterGrammarIssuesByLanguage(
    issues: GrammarIssue[],
    language: Language
): GrammarIssue[] {
    const englishOnly = new Set(['pronoun_case', 'subject_verb_agreement']);
    if (language === 'en') {
        return issues.filter((issue) => issue.type !== 'vi_only');
    }
    return issues.filter((issue) => !englishOnly.has(issue.type));
}
