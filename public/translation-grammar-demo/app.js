// Created by Cursor

const els = {
    sourceLang: document.getElementById('sourceLang'),
    targetLang: document.getElementById('targetLang'),
    levelField: document.getElementById('levelField'),
    level: document.getElementById('level'),
    swapBtn: document.getElementById('swapBtn'),
    inputText: document.getElementById('inputText'),
    outputText: document.getElementById('outputText'),
    submitBtn: document.getElementById('submitBtn'),
    detectedBadge: document.getElementById('detectedBadge'),
    modeBadge: document.getElementById('modeBadge'),
};
let isLoading = false;

function toggleLevelVisibility() {
    const show = els.targetLang.value === 'en';
    els.levelField.classList.toggle('is-hidden', !show);
    els.level.disabled = !show;
}

function buildPrompt(text, source, target, level) {
    void text;
    if (target === 'en') {
        return `Translate to English at CEFR level ${level}. Use appropriate vocabulary and sentence complexity.`;
    }
    if (target === 'vi' && source === 'en') {
        return 'Fix grammar and translate to Vietnamese.';
    }
    return 'Translate to Vietnamese.';
}

function setBusy(isBusy) {
    isLoading = isBusy;
    const isEmpty = !els.inputText.value.trim();
    els.submitBtn.disabled = isBusy || isEmpty;
    els.submitBtn.textContent = isBusy ? 'Đang phân tích...' : 'BẮT ĐẦU PHÂN TÍCH';
    els.modeBadge.textContent = isBusy ? 'Working…' : 'Ready';
}

function setDetectedLanguageBadge(lang) {
    if (!lang) {
        els.detectedBadge.hidden = true;
        els.detectedBadge.textContent = '';
        return;
    }
    els.detectedBadge.hidden = false;
    els.detectedBadge.textContent = `detected=${lang}`;
}

function detectLanguage(text) {
    return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
        text
    )
        ? 'vi'
        : 'en';
}

function updatePlaceholder() {
    const source = els.sourceLang.value;
    if (source === 'en') {
        els.inputText.placeholder = 'Enter English text...';
        return;
    }
    if (source === 'vi') {
        els.inputText.placeholder = 'Nhập văn bản tiếng Việt...';
        return;
    }
    els.inputText.placeholder = 'Nhập văn bản...';
}

function mockTranslate({ text, sourceLanguage, targetLanguage, level }) {
    const detected = detectLanguage(text);
    const effectiveSource = sourceLanguage === 'auto' ? detected : sourceLanguage;

    if (targetLanguage === 'en') {
        return {
            detectedLanguage: detected,
            outputText: `[MOCK EN ${level}] ${text}`,
        };
    }

    if (targetLanguage === 'vi' && effectiveSource === 'en') {
        return {
            detectedLanguage: 'en',
            outputText: `[MOCK VI] ${text}`,
            grammarCorrection: `[MOCK GRAMMAR FIX] ${text}`,
        };
    }

    return {
        detectedLanguage: detected,
        outputText: `[MOCK VI] ${text}`,
    };
}

async function handleTranslate() {
    const text = els.inputText.value.trim();
    if (!text) {
        alert('Please enter some text.');
        return;
    }

    const sourceLanguage = els.sourceLang.value;
    const targetLanguage = els.targetLang.value;
    const level = els.level.value;

    const uiPrompt = buildPrompt(text, sourceLanguage, targetLanguage, level);
    void uiPrompt; // prompt is built per requirements; server builds the full instruction prompt

    setBusy(true);
    setDetectedLanguageBadge(null);
    els.outputText.value = '';

    try {
        const response = await fetch('/api/translation-grammar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text,
                sourceLanguage,
                targetLanguage,
                level: targetLanguage === 'en' ? level : undefined,
            }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error ?? 'API Error');
        }

        const data = await response.json();
        els.outputText.value = data.outputText ?? '';
        setDetectedLanguageBadge(data.detectedLanguage);
    } catch (error) {
        console.error('[API Error]:', error);
        // Fallback for demo/portfolio when API key isn't configured.
        const fallback = mockTranslate({
            text,
            sourceLanguage,
            targetLanguage,
            level,
        });
        els.outputText.value = fallback.outputText ?? '';
        setDetectedLanguageBadge(fallback.detectedLanguage);
        els.modeBadge.textContent = 'Mock mode';
    } finally {
        setBusy(false);
    }
}

function handleSwap() {
    const prevSource = els.sourceLang.value;
    const prevTarget = els.targetLang.value;

    // Swap rules for demo:
    // - target becomes source (if target is en/vi)
    // - source becomes target (auto becomes target=vi to keep target valid)
    const nextSource = prevTarget;
    const nextTarget = prevSource === 'auto' ? 'vi' : prevSource;

    els.sourceLang.value = nextSource;
    els.targetLang.value = nextTarget;
    toggleLevelVisibility();
    updatePlaceholder();
}

function handleInputChange() {
    const isEmpty = !els.inputText.value.trim();
    els.submitBtn.disabled = isLoading || isEmpty;
}

els.targetLang.addEventListener('change', () => {
    toggleLevelVisibility();
});

els.sourceLang.addEventListener('change', () => {
    updatePlaceholder();
});

els.swapBtn.addEventListener('click', () => {
    handleSwap();
});

els.inputText.addEventListener('input', () => {
    handleInputChange();
});

els.submitBtn.addEventListener('click', () => {
    void handleTranslate();
});

toggleLevelVisibility();
updatePlaceholder();
handleInputChange();

