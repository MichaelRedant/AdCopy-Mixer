export interface AdVariant {
    id: string;
    product: string;
    targetAudience: string;
    platform: string;
    vibe: string;
    content: string;
    score: number;
}

export interface AdGenerationInput {
    product: string;
    targetAudience: string;
    platform: string;
    vibe: string;
}

export interface LocalStorageData {
    adVariants: AdVariant[];
    lastGenerated: Date;
}