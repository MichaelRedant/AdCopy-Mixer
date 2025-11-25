import {
  AdVariant,
  CampaignArchitecture,
  CampaignBlueprint,
  FormValues,
  GptModel,
  RemixIntent,
  ScoreMetricKey,
  VariantScore,
} from '../types';
import {
  SYSTEM_PROMPT,
  buildRemixPrompt,
  buildScoringPrompt,
  buildUserPrompt,
  buildTipRemixPrompt,
  buildTipApplicationPrompt,
  buildAngleExpandPrompt,
  buildHookGeneratorPrompt,
  buildBlueprintPrompt,
  buildNamingPrompt,
} from '../utils/promptBuilders';

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
): Promise<{ variants: AdVariant[]; advice?: string; architecture?: CampaignArchitecture }> => {
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
  persona?: string,
  signal?: AbortSignal,
): Promise<{ variants: AdVariant[]; advice?: string }> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildRemixPrompt(intent, variant, persona) },
  ];

  return callChatCompletion(apiKey, model, messages, signal);
};

export const scoreVariant = async (
  apiKey: string,
  model: GptModel,
  variant: AdVariant,
  performanceContext?: string,
  signal?: AbortSignal,
): Promise<VariantScore> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'Je bent een kritische advertentie-analist.' },
    { role: 'user', content: buildScoringPrompt(variant, performanceContext) },
  ];

  const response = await callChatCompletion<{
    relevance: { score: number; tip: string };
    clarity: { score: number; tip: string };
    valueProposition: { score: number; tip: string };
    emotionHook: { score: number; tip: string };
    ctaPower: { score: number; tip: string };
    platformFit: { score: number; tip: string };
    originality: { score: number; tip: string };
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

export const remixScoreTip = async (
  apiKey: string,
  model: GptModel,
  variant: AdVariant,
  metric: ScoreMetricKey,
  currentTip: string,
  signal?: AbortSignal,
): Promise<string> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: 'Je bent een conversiecopy-coach die concrete verbeteracties formuleert.' },
    { role: 'user', content: buildTipRemixPrompt(metric, currentTip, variant) },
  ];

  const response = await callChatCompletion<{ tip: string }>(apiKey, model, messages, signal);
  return response.tip;
};

export const applyScoreTip = async (
  apiKey: string,
  model: GptModel,
  variant: AdVariant,
  metric: ScoreMetricKey,
  tip: string,
  persona?: string,
  signal?: AbortSignal,
): Promise<{ variants: AdVariant[]; advice?: string }> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildTipApplicationPrompt(metric, tip, variant, persona) },
  ];

  return callChatCompletion(apiKey, model, messages, signal);
};

export const expandAngle = async (
  apiKey: string,
  model: GptModel,
  angle: import('../utils/angles').AngleKey,
  values: FormValues,
  signal?: AbortSignal,
): Promise<{ hooks: string[]; primaryText: string; headline: string }> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildAngleExpandPrompt(angle, values) },
  ];

  return callChatCompletion(apiKey, model, messages, signal);
};

export const generateHooks = async (
  apiKey: string,
  model: GptModel,
  category: import('../utils/hooks').HookCategory,
  values: FormValues,
  signal?: AbortSignal,
): Promise<{ hooks: string[] }> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildHookGeneratorPrompt(category, values) },
  ];

  return callChatCompletion(apiKey, model, messages, signal);
};

export const generateBlueprint = async (
  apiKey: string,
  model: GptModel,
  values: FormValues,
  signal?: AbortSignal,
): Promise<CampaignBlueprint> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildBlueprintPrompt(values) },
  ];

  return callChatCompletion(apiKey, model, messages, signal);
};

export const generateNames = async (
  apiKey: string,
  model: GptModel,
  values: FormValues,
  signal?: AbortSignal,
): Promise<{ names: string[] }> => {
  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildNamingPrompt(values) },
  ];

  return callChatCompletion(apiKey, model, messages, signal);
};
