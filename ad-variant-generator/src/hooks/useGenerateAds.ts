import { useState } from 'react';
import { generateAds } from '../services/chatgpt';
import { AdVariant } from '../types';

const useGenerateAds = () => {
    const [ads, setAds] = useState<AdVariant[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const generateAdVariants = async (product: string, targetAudience: string, platform: string, vibe: string) => {
        setLoading(true);
        setError(null);
        try {
            const adVariants = await generateAds(product, targetAudience, platform, vibe);
            setAds(adVariants);
        } catch (err) {
            setError('Failed to generate ads. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return { ads, loading, error, generateAdVariants };
};

export default useGenerateAds;