import React from 'react';
import { useLocation } from 'react-router-dom';
import AdCard from '../components/AdCard';

const Results = () => {
    const location = useLocation();
    const { adVariants } = location.state || { adVariants: [] };

    return (
        <div>
            <h1>Generated Advertisement Variants</h1>
            {adVariants.length > 0 ? (
                <div>
                    {adVariants.map((ad, index) => (
                        <AdCard key={index} ad={ad} />
                    ))}
                </div>
            ) : (
                <p>No advertisement variants generated. Please go back and fill out the form.</p>
            )}
        </div>
    );
};

export default Results;