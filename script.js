const sourceLanguage = document.getElementById("sourceLanguage");
const targetLanguage = document.getElementById("targetLanguage");
const cefrLevel = document.getElementById("cefrLevel");
const levelWrapper = document.getElementById("levelWrapper");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const swapBtn = document.getElementById("swapBtn");
const statusMessage = document.getElementById("statusMessage");
const btnText = translateBtn.querySelector(".btn-text");
const spinner = translateBtn.querySelector(".spinner");

const LANGUAGE_LABEL = {
  en: "English",
  vi: "Vietnamese"
};

function detectLanguage(text) {
  const cleaned = text.trim();
  if (!cleaned) return "vi";

  const hasVietnameseChars = /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i.test(cleaned);
  const hasEnglishWords = /\b(the|and|is|are|you|we|they|to|for|with|this|that|of|in)\b/i.test(cleaned);

  if (hasVietnameseChars) return "vi";
  if (hasEnglishWords) return "en";

  const letters = cleaned.match(/[a-z]/gi) || [];
  return letters.length >= cleaned.length * 0.35 ? "en" : "vi";
}

function buildPrompt(text, source, target, level) {
  if (target === "en") {
    const cefrGuide = {
      "A1-A2": "Use simple words and short sentences.",
      "B1-B2": "Use natural phrasing with moderate sentence complexity.",
      "C1-C2": "Use advanced vocabulary and fluent, nuanced structures."
    };

    return [
      `Translate to English at CEFR level ${level}. Use appropriate vocabulary and sentence complexity.`,
      cefrGuide[level],
      `Source language: ${LANGUAGE_LABEL[source] || "Auto-detected"}.`,
      "Output only the final translated text."
    ].join(" ");
  }

  if (target === "vi" && source === "en") {
    return "Fix grammar and translate to Vietnamese.";
  }

  return "Translate to Vietnamese.";
}

function updatePlaceholder() {
  if (sourceLanguage.value === "en") {
    inputText.placeholder = "Enter English text...";
    return;
  }

  if (sourceLanguage.value === "vi") {
    inputText.placeholder = "Nhập văn bản tiếng Việt...";
    return;
  }

  inputText.placeholder = "Nhập văn bản...";
}

function toggleLevelVisibility() {
  const showLevel = targetLanguage.value === "en";
  levelWrapper.classList.toggle("hidden", !showLevel);
  cefrLevel.disabled = !showLevel;
}

function handleSwap() {
  const oldSource = sourceLanguage.value;
  const oldTarget = targetLanguage.value;

  sourceLanguage.value = oldTarget;
  targetLanguage.value = oldSource === "auto" ? "vi" : oldSource;

  toggleLevelVisibility();
  updatePlaceholder();
}

function setLoadingState(isLoading) {
  translateBtn.disabled = isLoading || inputText.value.trim().length === 0;
  btnText.textContent = isLoading ? "Đang phân tích..." : "BẮT ĐẦU PHÂN TÍCH";
  spinner.classList.toggle("hidden", !isLoading);
}

async function handleTranslate() {
  const text = inputText.value.trim();
  if (!text) return;

  setLoadingState(true);
  statusMessage.textContent = "";

  try {
    let source = sourceLanguage.value;
    const target = targetLanguage.value;
    const level = cefrLevel.value;

    if (source === "auto") {
      source = detectLanguage(text);
      statusMessage.textContent = `Đã nhận diện ngôn ngữ đầu vào: ${LANGUAGE_LABEL[source]}.`;
    }

    const prompt = buildPrompt(text, source, target, level);

    // Demo processing. Replace with real API call when integrating an LLM.
    await new Promise((resolve) => setTimeout(resolve, 900));
    const rendered = [
      "[Prompt]",
      prompt,
      "",
      "[Source]",
      text,
      "",
      "[Demo Output]",
      `(${LANGUAGE_LABEL[source]} -> ${LANGUAGE_LABEL[target]})`,
      "Nội dung đã được xử lý theo quy tắc đã cấu hình."
    ].join("\n");

    outputText.value = rendered;
  } catch (error) {
    outputText.value = "";
    statusMessage.textContent = "Có lỗi xảy ra khi phân tích. Vui lòng thử lại.";
    console.error(error);
  } finally {
    setLoadingState(false);
  }
}

function updateActionButtonState() {
  if (inputText.value.trim().length === 0) {
    translateBtn.disabled = true;
    return;
  }

  if (btnText.textContent !== "Đang phân tích...") {
    translateBtn.disabled = false;
  }
}

inputText.addEventListener("input", updateActionButtonState);
sourceLanguage.addEventListener("change", updatePlaceholder);
targetLanguage.addEventListener("change", () => {
  toggleLevelVisibility();
});
swapBtn.addEventListener("click", handleSwap);
translateBtn.addEventListener("click", handleTranslate);

toggleLevelVisibility();
updatePlaceholder();
updateActionButtonState();
