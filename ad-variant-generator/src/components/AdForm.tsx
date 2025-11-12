import React, { useState } from 'react';

const AdForm: React.FC<{ onGenerate: (data: any) => void }> = ({ onGenerate }) => {
    const [product, setProduct] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [platform, setPlatform] = useState('');
    const [vibe, setVibe] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate({ product, targetAudience, platform, vibe });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Product:</label>
                <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Target Audience:</label>
                <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Platform:</label>
                <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Vibe:</label>
                <input
                    type="text"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Generate Ads</button>
        </form>
    );
};

export default AdForm;