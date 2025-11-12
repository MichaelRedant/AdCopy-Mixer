import { AdVariant, FormValues, GptModel, RemixIntent, VariantScore } from '../types';
import { SYSTEM_PROMPT, buildRemixPrompt, buildScoringPrompt, buildUserPrompt } from '../utils/promptBuilders';

const CHAT_COMPLETIONS_URL = 'https://api.openai.com/v1/chat/completions';
interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

const callChatCompletion = async <T>(
  apiKey: string,
  model: GptModel,
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<T> => {
  const response = await fetch(CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages,
    }),
    signal,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${message}`);
  }

  const data = await response.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('Model returned no content');
  }

  try {
    return JSON.parse(content) as T;
  } catch (error) {
    throw new Error('Model antwoordde geen geldig JSON');
  }
};

export const generateVariants = async (
  apiKey: string,
  model: GptModel,
  values: FormValues,
  options?: { extraInstruction?: string },
  signal?: AbortSignal,
): Promise<{ variants: AdVariant[]; advice?: string }> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(values) },
  ];

  if (options?.extraInstruction) {
    messages.push({ role: 'user', content: options.extraInstruction });
  }

  return callChatCompletion(apiKey, model, messages, signal);
};

export const remixVariant = async (
  apiKey: string,
  model: GptModel,
  intent: RemixIntent,
  variant: AdVariant,
  signal?: AbortSignal,
): Promise<{ variants: AdVariant[]; advice?: string }> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildRemixPrompt(intent, variant) },
  ];

  return callChatCompletion(apiKey, model, messages, signal);
};

export const scoreVariant = async (
  apiKey: string,
  model: GptModel,
  variant: AdVariant,
  signal?: AbortSignal,
): Promise<VariantScore> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'Je bent een kritische advertentie-analist.' },
    { role: 'user', content: buildScoringPrompt(variant) },
  ];

  const response = await callChatCompletion<{
    clarity: { score: number; tip: string };
    emotion: { score: number; tip: string };
    distinctiveness: { score: number; tip: string };
    ctaStrength: { score: number; tip: string };
    total: number;
    summary: string;
    overallTip: string;
  }>(
    apiKey,
    model,
    messages,
    signal,
  );

  return { ...response, updatedAt: Date.now() };
};
