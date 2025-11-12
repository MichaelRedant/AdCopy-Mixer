import { FavoriteVariant } from '../types';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportFavoritesToJSON = (favorites: FavoriteVariant[]) => {
  const blob = new Blob([JSON.stringify(favorites, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `adcopy-favorites-${new Date().toISOString()}.json`);
};

export const exportFavoritesToCSV = (favorites: FavoriteVariant[]) => {
  const header = ['campaign', 'platform', 'vibe', 'headline', 'primaryText', 'description', 'cta'];
  const rows = favorites.map((favorite) => {
    const headline = Array.isArray(favorite.variant.headline)
      ? favorite.variant.headline.join(' | ')
      : favorite.variant.headline;
    return [
      escapeCell(favorite.campaign),
      favorite.platform,
      favorite.vibe,
      escapeCell(headline),
      escapeCell(favorite.variant.primaryText),
      escapeCell(favorite.variant.description),
      escapeCell(favorite.variant.cta),
    ].join(',');
  });

  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `adcopy-favorites-${new Date().toISOString()}.csv`);
};

const escapeCell = (value: string) => {
  const needsQuotes = value.includes(',') || value.includes('\n') || value.includes('"');
  let sanitized = value.replace(/"/g, '""');
  if (needsQuotes) {
    sanitized = `"${sanitized}"`;
  }
  return sanitized;
};
