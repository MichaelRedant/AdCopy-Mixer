import { AdVariant } from '../types';

export const buildAdPrompt = (product: string, targetAudience: string, platform: string, vibe: string): string => {
    return `Generate advertisement variants for the product "${product}" targeting "${targetAudience}" on the "${platform}" platform with a "${vibe}" vibe. Provide 3-6 unique variants.`;
};

export const buildRemixPrompt = (adVariants: AdVariant[]): string => {
    const variantsText = adVariants.map(variant => variant.text).join('\n');
    return `Remix the following advertisement variants:\n${variantsText}\nProvide new variations based on these.`;
};