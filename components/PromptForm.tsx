import React, { useRef } from 'react';
import { AspectRatio } from '../types';

interface PromptFormProps {
  prompt: string;
  setPrompt: (p: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isPromptLoading: boolean;
  onEnhance: () => void;
  onSuggest: () => void;
  baseImage: string | null;
  setBaseImage: (image: string | null) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ar: AspectRatio) => void;
  selectedStyle: string;
  setSelectedStyle: (style: string) => void;
  t: (key: string) => string;
}


export const PromptForm: React.FC<PromptFormProps> = ({
  prompt,
  setPrompt,
  handleSubmit,
  isLoading,
  isPromptLoading,
  onEnhance,
  onSuggest,
  baseImage,
  setBaseImage,
  aspectRatio,
  setAspectRatio,
  selectedStyle,
  setSelectedStyle,
  t,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios: { key: AspectRatio; label: string }[] = [
    { key: '9:16', label: t('aspectRatioPortrait') },
    { key: '1:1', label: t('aspectRatioSquare') },
    { key: '16:9', label: t('aspectRatioLandscape') },
    { key: '3:4', label: t('aspectRatioClassic34') },
    { key: '4:3', label: t('aspectRatioClassic43') },
  ];

  const styles: { key: string; label: string }[] = [
      { key: 'ghibli', label: t('styleGhibli') },
      { key: 'cyberpunk', label: t('styleCyberpunk') },
      { key: 'steampunk', label: t('styleSteampunk') },
      { key: 'pixel', label: t('stylePixel') },
      { key: 'fantasy', label: t('styleFantasy') },
  ];


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setBaseImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  let step = 1;
  const imageStep = step++;
  const promptStep = step++;
  const styleStep = baseImage ? -1 : step++;
  const aspectStep = baseImage ? -1 : step++;


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-purple-300 mb-2">
          {imageStep}. {baseImage ? t('step1Edit') : t('step1Optional')}
        </label>
        {baseImage ? (
          <div className="relative group">
            <img src={baseImage} alt="Preview" className="w-full max-h-48 object-contain rounded-lg border border-gray-600 bg-black/20" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-all opacity-50 group-hover:opacity-100"
              aria-label={t('removeImage')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className="flex justify-center items-center w-full p-6 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-purple-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-2 text-sm text-gray-400">
                <span className="font-semibold text-purple-400">{t('uploadClick')}</span> {t('uploadDrag')}
              </p>
              <p className="text-xs text-gray-500">{t('uploadFormats')}</p>
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="prompt" className="text-lg font-medium text-purple-300">
            {promptStep}. {baseImage ? t('step2DescribeEdit') : t('step2Describe')}
          </label>
          <div className="flex items-center gap-2">
             <button
              type="button"
              onClick={onEnhance}
              disabled={isLoading || isPromptLoading || !prompt}
              className="text-xs flex items-center gap-1 text-purple-300 bg-purple-900/50 hover:bg-purple-900/80 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('enhanceTooltip')}
            >
              ✨ {t('enhanceButton')}
            </button>
            <button
              type="button"
              onClick={onSuggest}
              disabled={isLoading || isPromptLoading}
              className="text-xs flex items-center gap-1 text-yellow-300 bg-yellow-900/50 hover:bg-yellow-900/80 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               title={t('suggestTooltip')}
            >
              💡 {t('suggestButton')}
            </button>
          </div>
        </div>
        <textarea
          id="prompt"
          rows={3}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500"
          placeholder={baseImage ? t('promptPlaceholderEdit') : t('promptPlaceholder')}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
      </div>

      {!baseImage && (
        <>
         <div>
            <label className="block text-lg font-medium text-purple-300 mb-2">
              {styleStep}. {t('step3Style')}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {styles.map((style) => (
                <button
                  type="button"
                  key={style.key}
                  onClick={() => setSelectedStyle(style.key)}
                  className={`p-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                    selectedStyle === style.key
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-lg font-medium text-purple-300 mb-2">
              {aspectStep}. {t('step4Dimensions')}
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {aspectRatios.map((ar) => (
                <button
                  type="button"
                  key={ar.key}
                  onClick={() => setAspectRatio(ar.key)}
                  className={`p-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                    aspectRatio === ar.key
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500'
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={isLoading || !prompt}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t('generatingButton')}</span>
          </>
        ) : (
          <span>{t('generateButton')}</span>
        )}
      </button>
    </form>
  );
};