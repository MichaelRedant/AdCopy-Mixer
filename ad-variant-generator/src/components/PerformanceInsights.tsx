import React from 'react';

interface PerformanceInsightsProps {
  insights: string[];
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  return (
    <section className="glass-panel performance-panel" aria-label="Performance inzichten">
      <header className="performance-header">
        <h3>Performance patterns</h3>
        <p>Gebaseerd op je ingevoerde CTR/ROAS/CPA-data.</p>
      </header>
      <ul className="performance-list">
        {insights.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
};

export default PerformanceInsights;
