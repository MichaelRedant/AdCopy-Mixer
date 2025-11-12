import React from 'react';

interface AdCardProps {
    title: string;
    description: string;
    targetAudience: string;
    platform: string;
    vibe: string;
    score: number;
}

const AdCard: React.FC<AdCardProps> = ({ title, description, targetAudience, platform, vibe, score }) => {
    return (
        <div className="ad-card">
            <h3>{title}</h3>
            <p>{description}</p>
            <p><strong>Target Audience:</strong> {targetAudience}</p>
            <p><strong>Platform:</strong> {platform}</p>
            <p><strong>Vibe:</strong> {vibe}</p>
            <p><strong>Score:</strong> {score}</p>
            <button onClick={() => alert('Action taken!')}>Take Action</button>
        </div>
    );
};

export default AdCard;