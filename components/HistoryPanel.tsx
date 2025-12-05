import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  t: (key: string) => string;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
  t,
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir={document.documentElement.dir}
      >
        <div className="flex flex-col h-full">
          <header className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-purple-300">{t('historyTitle')}</h2>
            <div className="flex items-center gap-2">
               {history.length > 0 && (
                <button
                    onClick={onClear}
                    className="text-sm text-red-400 hover:text-red-300 hover:bg-red-900/50 p-2 rounded-md transition-colors"
                    aria-label={t('clearHistory')}
                >
                    {t('clearHistory')}
                </button>
               )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
                aria-label={t('closePanel')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-grow p-4 overflow-y-auto">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg">{t('historyEmptyTitle')}</p>
                <p className="text-sm">{t('historyEmptySubtitle')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="relative group cursor-pointer aspect-w-9 aspect-h-16"
                    onClick={() => onSelect(item)}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="w-full h-full object-cover rounded-md group-hover:opacity-80 transition-opacity"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-white text-xs line-clamp-2">{item.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};