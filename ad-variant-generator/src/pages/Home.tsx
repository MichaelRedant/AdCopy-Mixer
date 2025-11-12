import React, { useState } from 'react';
import AdForm from '../components/AdForm';
import { useGenerateAds } from '../hooks/useGenerateAds';

const Home: React.FC = () => {
    const [ads, setAds] = useState([]);
    const { generateAds } = useGenerateAds();

    const handleGenerateAds = async (formData) => {
        const generatedAds = await generateAds(formData);
        setAds(generatedAds);
    };

    return (
        <div>
            <h1>Advertisement Variant Generator</h1>
            <AdForm onGenerateAds={handleGenerateAds} />
            {ads.length > 0 && (
                <div>
                    <h2>Generated Ads</h2>
                    {ads.map((ad, index) => (
                        <div key={index}>
                            <h3>{ad.title}</h3>
                            <p>{ad.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;