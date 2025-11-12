import React, { useMemo, useState } from 'react';
import { FavoriteVariant } from '../types';
import { exportFavoritesToCSV, exportFavoritesToJSON } from '../utils/exporters';

interface FavoritesDrawerProps {
  favorites: FavoriteVariant[];
  isOpen: boolean;
  onClose: () => void;
  onCopy: (favorite: FavoriteVariant) => void;
  onDelete: (favoriteId: string) => void;
}

const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ favorites, isOpen, onClose, onCopy, onDelete }) => {
  const [campaignFilter, setCampaignFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [vibeFilter, setVibeFilter] = useState('');

  const filteredFavorites = useMemo(() => {
    return favorites.filter((favorite) => {
      const matchesCampaign = campaignFilter
        ? favorite.campaign.toLowerCase().includes(campaignFilter.toLowerCase())
        : true;
      const matchesPlatform = platformFilter ? favorite.platform === platformFilter : true;
      const matchesVibe = vibeFilter ? favorite.vibe === vibeFilter : true;
      return matchesCampaign && matchesPlatform && matchesVibe;
    });
  }, [favorites, campaignFilter, platformFilter, vibeFilter]);

  if (!isOpen) {
    return null;
  }

  return (
    <aside className="favorites-drawer glass-drawer" aria-label="Favorieten">
      <div className="drawer-header">
        <h2>Favorieten</h2>
        <button type="button" onClick={onClose} aria-label="Sluit favorieten">×</button>
      </div>
      <div className="drawer-controls">
        <input
          type="search"
          placeholder="Zoek op campagne"
          value={campaignFilter}
          onChange={(event) => setCampaignFilter(event.target.value)}
        />
        <select value={platformFilter} onChange={(event) => setPlatformFilter(event.target.value)}>
          <option value="">Alle platformen</option>
          <option value="meta">Meta</option>
          <option value="google">Google Ads</option>
          <option value="linkedin">LinkedIn</option>
          <option value="x">X</option>
          <option value="instagram">Instagram</option>
        </select>
        <select value={vibeFilter} onChange={(event) => setVibeFilter(event.target.value)}>
          <option value="">Alle vibes</option>
          <option value="playful">Playful</option>
          <option value="urgent">Urgent</option>
          <option value="luxe">Luxe</option>
          <option value="betrouwbaar">Betrouwbaar</option>
          <option value="rebels">Rebels</option>
          <option value="minimal">Minimal</option>
          <option value="warm-menselijk">Warm & Menselijk</option>
          <option value="no-nonsense">No-nonsense</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <div className="drawer-actions">
        <button type="button" onClick={() => exportFavoritesToCSV(filteredFavorites)}>
          Export naar CSV
        </button>
        <button type="button" onClick={() => exportFavoritesToJSON(filteredFavorites)}>
          Export naar JSON
        </button>
      </div>
      <div className="drawer-list">
        {filteredFavorites.length === 0 ? (
          <p>Geen favorieten gevonden.</p>
        ) : (
          filteredFavorites.map((favorite) => {
            const headline = Array.isArray(favorite.variant.headline)
              ? favorite.variant.headline.join(' | ')
              : favorite.variant.headline;
            return (
              <div className="drawer-item" key={favorite.id}>
                <div>
                  <h3>{headline}</h3>
                  <p>{favorite.variant.primaryText}</p>
                  <p className="drawer-meta">
                    {favorite.campaign} · {favorite.platform} · {favorite.vibe}
                  </p>
                </div>
                <div className="drawer-buttons">
                  <button type="button" onClick={() => onCopy(favorite)}>
                    Kopieer
                  </button>
                  <button type="button" onClick={() => onDelete(favorite.id)}>
                    Verwijder
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default FavoritesDrawer;
