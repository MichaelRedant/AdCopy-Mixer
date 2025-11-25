export type HookCategory =
  | 'shortPunch'
  | 'questions'
  | 'challenge'
  | 'data'
  | 'pain'
  | 'dream'
  | 'objection';

export const HOOK_CATEGORIES: { key: HookCategory; label: string; helper: string }[] = [
  { key: 'shortPunch', label: 'Short punch (<40)', helper: 'Supersnelle haak, max 40 tekens.' },
  { key: 'questions', label: 'Questions', helper: 'Start met een vraag die nieuwsgierigheid prikkelt.' },
  { key: 'challenge', label: 'Challenge hooks', helper: 'Daag de lezer uit met een stelling of uitdaging.' },
  { key: 'data', label: 'Data/number', helper: 'Gebruik cijfers of percentages als bewijs.' },
  { key: 'pain', label: 'Pain hooks', helper: 'Begin bij het pijnpunt of frustratie.' },
  { key: 'dream', label: 'Dream hooks', helper: 'Schets het gewenste resultaat of droom.' },
  { key: 'objection', label: 'Objection-busting', helper: 'Neutraliseer twijfels of bezwaren upfront.' },
];
