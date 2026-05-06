import { z } from 'zod';
import { NextResponse } from 'next/server';
import { runOfflineTranslation } from '@/lib/translator';

const requestSchema = z.object({
  text: z.string().default(''),
  sourceLanguage: z.enum(['auto', 'en', 'vi']).default('auto'),
  targetLanguage: z.enum(['en', 'vi']).default('en'),
  level: z.enum(['A1-A2', 'B1-B2', 'C1-C2']).optional(),
});

function toRoutePayload(result: Awaited<ReturnType<typeof runOfflineTranslation>>) {
  return {
    success: true as const,
    translation: result.translatedText ?? '',
    sourceLanguage: result.sourceLanguage,
    targetLanguage: result.targetLanguage,
    grammar: result.grammarIssues ?? [],
    correctedText: result.correctedText ?? '',
    confidence: result.confidence ?? 0,
  };
}

function buildSafePayload() {
  return {
    success: true as const,
    translation: '',
    sourceLanguage: 'en' as const,
    targetLanguage: 'vi' as const,
    grammar: [],
    correctedText: '',
    confidence: 0,
  };
}

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = requestSchema.safeParse(raw);
    if (!parsed.success) {
      console.warn('[Translate Route Warning]: Invalid payload shape');
      return NextResponse.json(buildSafePayload());
    }

    const result = await runOfflineTranslation({
      text: parsed.data.text,
      sourceLanguage: parsed.data.sourceLanguage,
      targetLanguage: parsed.data.targetLanguage,
      level: parsed.data.level,
    });

    return NextResponse.json(toRoutePayload(result));
  } catch (error) {
    console.warn('[Translate Route Warning]:', error);
    return NextResponse.json(buildSafePayload());
  }
}
