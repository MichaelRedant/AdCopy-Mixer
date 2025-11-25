export type AngleKey =
  | 'problemFirst'
  | 'statusFirst'
  | 'valueFirst'
  | 'socialProofFirst'
  | 'competitorFirst'
  | 'fomo'
  | 'efficiency'
  | 'priceSensitive'
  | 'oldVsNew';

export const ANGLE_OPTIONS: { key: AngleKey; label: string; helper: string }[] = [
  { key: 'problemFirst', label: 'Problem-first', helper: 'Start vanuit pijnpunt of frustratie.' },
  { key: 'statusFirst', label: 'Status-first', helper: 'Speel in op status, prestige of vooruitgang.' },
  { key: 'valueFirst', label: 'Value-first', helper: 'Benadruk het concrete resultaat of voordeel.' },
  { key: 'socialProofFirst', label: 'Social proof-first', helper: 'Gebruik bewijs: aantal klanten, reviews, cases.' },
  { key: 'competitorFirst', label: 'Competitor-first', helper: 'Zet je af tegen de oude tool of concurrent.' },
  { key: 'fomo', label: 'Fear of missing out', helper: 'Beperk tijd/slots en benadruk gemiste kans.' },
  { key: 'efficiency', label: 'Efficiency angle', helper: 'Bespaart tijd/effort; sneller, lichter, minder werk.' },
  { key: 'priceSensitive', label: 'Price-sensitive', helper: 'Prijsvoordeel, ROI, lagere TCO.' },
  { key: 'oldVsNew', label: 'Old way vs new way', helper: 'Confronteer oude werkwijze met jouw nieuwe aanpak.' },
];
