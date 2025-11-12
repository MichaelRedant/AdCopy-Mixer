import React, { useEffect, useState } from 'react';
import { clearRuntimeKey, loadRuntimeKey, saveRuntimeKey } from '../utils/storage';

interface ApiKeyModalProps {
  onClose: (apiKey: string | null) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  const [key, setKey] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const stored = loadRuntimeKey();
    if (stored) {
      setKey(stored);
      setIsOpen(false);
      onClose(stored);
    }
  }, [onClose]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!key.trim()) {
      return;
    }
    saveRuntimeKey(key.trim());
    setIsOpen(false);
    onClose(key.trim());
  };

  const handleClear = () => {
    clearRuntimeKey();
    setKey('');
    setIsOpen(true);
    onClose(null);
  };

  if (!isOpen) {
    return (
      <button className="toolbar-button" onClick={() => setIsOpen(true)}>
        API-sleutel wijzigen
      </button>
    );
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="apikey-title">
      <form className="modal" onSubmit={handleSubmit}>
        <h2 id="apikey-title">Voer je OpenAI API-sleutel in</h2>
        <p className="modal-description">
          De sleutel wordt enkel in sessionStorage bewaard. Plaats geen sleutel op gedeelde toestellen.
        </p>
        <label className="modal-label" htmlFor="api-key-input">
          API-sleutel
        </label>
        <input
          id="api-key-input"
          type="password"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          autoFocus
          placeholder="sk-..."
        />
        <div className="modal-actions">
          <button type="submit" className="primary">
            Bewaren & sluiten
          </button>
          <button type="button" onClick={handleClear} className="secondary">
            Wissen
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApiKeyModal;
