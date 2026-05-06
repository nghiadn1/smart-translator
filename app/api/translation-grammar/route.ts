// Created by Cursor
import { z } from 'zod';
import {
    runOfflineTranslation,
    type TranslationResponse,
} from '@/lib/translator';

const requestSchema = z.object({
    text: z.string().default(''),
    sourceLanguage: z.enum(['auto', 'vi', 'en']).default('auto'),
    targetLanguage: z.enum(['vi', 'en']).default('en'),
    level: z.enum(['A1-A2', 'B1-B2', 'C1-C2']).optional(),
});

function buildSafeResponse(
    fallbackText: string,
    fallbackTarget: 'vi' | 'en',
    message: string
): Promise<TranslationResponse> {
    return runOfflineTranslation({
        text: fallbackText,
        sourceLanguage: 'auto',
        targetLanguage: fallbackTarget,
    }).then((result) => ({ ...result, message }));
}

export async function POST(request: Request) {
    try {
        const raw = await request.json().catch(() => ({}));
        if (!raw || typeof raw !== 'object') {
            return Response.json(
                await buildSafeResponse(
                    '',
                    'en',
                    'Invalid JSON body. Returned safe offline fallback result.'
                )
            );
        }
        const parsed = requestSchema.safeParse(raw);
        if (!parsed.success) {
            console.warn('[Translation Grammar Route Warning]: Invalid payload shape');
            return Response.json(
                await buildSafeResponse(
                    typeof raw?.text === 'string' ? raw.text : '',
                    raw?.targetLanguage === 'vi' ? 'vi' : 'en',
                    'Invalid request payload. Returned offline fallback result.'
                )
            );
        }

        const result = await runOfflineTranslation(parsed.data);
        return Response.json(result);
    } catch (error) {
        console.warn('[Translation Grammar Route Warning]:', error);
        return Response.json(
            await buildSafeResponse(
                '',
                'en',
                'Unexpected local processing issue. Returned safe offline fallback result.'
            )
        );
    }
}
