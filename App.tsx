import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { ImageDisplay } from './components/ImageDisplay';
import { Footer } from './components/Footer';
import { HistoryPanel } from './components/HistoryPanel';
import { generateWallpaper, enhancePrompt, suggestPrompt, upscaleImage } from './services/geminiService';
import { HistoryItem, AspectRatio, Language } from './types';
import { translations } from './translations';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [selectedStyle, setSelectedStyle] = useState<string>('ghibli');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<string>('');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('ar');

  const t = useCallback((key: string): string => {
    const langDict = translations[language];
    // Simple key-value lookup
    const text = key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, langDict);
    return text;
  }, [language]);

  useEffect(() => {
    const detectedLang = localStorage.getItem('language') || (navigator.language.startsWith('ar') ? 'ar' : 'en');
    setLanguage(detectedLang as Language);

    // PWA install prompt handler
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt event fired');
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Load history from localStorage
    try {
      const storedHistory = localStorage.getItem('wallpaperHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const handleGenerate = useCallback(async () => {
    if (!prompt || isLoading || isUpscaling) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setLastGeneratedPrompt(prompt);

    try {
      let imageToProcess: { data: string; mimeType: string; } | null = null;
      if (baseImage) {
        const [header, base64Data] = baseImage.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (base64Data && mimeType) {
            imageToProcess = { data: base64Data, mimeType };
        }
      }

      const generatedImageUrl = await generateWallpaper(prompt, imageToProcess, imageToProcess ? null : aspectRatio, imageToProcess ? null : selectedStyle);
      setImageUrl(generatedImageUrl);
      
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        prompt: prompt,
        imageUrl: generatedImageUrl,
        createdAt: new Date().toISOString(),
        baseImageUrl: baseImage,
        aspectRatio: imageToProcess ? undefined : aspectRatio,
        style: imageToProcess ? undefined : selectedStyle,
      };

      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory].slice(0, 15);
        localStorage.setItem('wallpaperHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (err) {
      console.error(err);
      setError(t('apiError'));
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, isUpscaling, baseImage, aspectRatio, selectedStyle, t]);
  
  const handleUpscale = useCallback(async () => {
    if (!imageUrl || isLoading || isUpscaling) return;
    
    setIsUpscaling(true);
    setError(null);

    try {
        const [header, base64Data] = imageUrl.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1];
        if (!base64Data || !mimeType) {
            throw new Error("Invalid image URL format for upscaling.");
        }
        
        const upscaledImageUrl = await upscaleImage({ data: base64Data, mimeType });
        setImageUrl(upscaledImageUrl);

        setHistory(prevHistory => {
            const updatedHistory = prevHistory.map(item => 
                item.imageUrl === imageUrl ? { ...item, imageUrl: upscaledImageUrl } : item
            );
            localStorage.setItem('wallpaperHistory', JSON.stringify(updatedHistory));
            return updatedHistory;
        });

    } catch (err) {
      console.error(err);
      setError(t('upscaleError'));
    } finally {
        setIsUpscaling(false);
    }
  }, [imageUrl, isLoading, isUpscaling, t]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!prompt || isPromptLoading) return;
    setIsPromptLoading(true);
    try {
      const enhanced = await enhancePrompt(prompt, language);
      setPrompt(enhanced);
    } catch (err) {
      alert(t('enhanceError'));
    } finally {
      setIsPromptLoading(false);
    }
  }, [prompt, isPromptLoading, language, t]);

  const handleSuggestPrompt = useCallback(async () => {
    if (isPromptLoading) return;
    setIsPromptLoading(true);
    try {
      const suggestion = await suggestPrompt(language);
      setPrompt(suggestion);
    } catch (err) {
      alert(t('suggestError'));
    } finally {
      setIsPromptLoading(false);
    }
  }, [isPromptLoading, language, t]);


  const handleSelectFromHistory = (item: HistoryItem) => {
    setImageUrl(item.imageUrl);
    setPrompt(item.prompt);
    setBaseImage(item.baseImageUrl || null);
    setAspectRatio(item.aspectRatio || '9:16');
    setSelectedStyle(item.style || 'ghibli');
    setLastGeneratedPrompt(item.prompt);
    setError(null);
    setIsHistoryPanelOpen(false);
  };

  const handleClearHistory = () => {
    if (window.confirm(t('clearHistoryConfirm'))) {
      setHistory([]);
      localStorage.removeItem('wallpaperHistory');
    }
  };

  const handleInstallClick = () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      setInstallPrompt(null);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerate();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white selection:bg-purple-500 selection:text-white">
      <Header 
        onHistoryClick={() => setIsHistoryPanelOpen(true)} 
        language={language}
        setLanguage={setLanguage}
        t={t}
      />
      {installPrompt && (
        <div className="px-4 pb-2 text-center">
            <button
              onClick={handleInstallClick}
              className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-300 text-sm animate-pulse"
              aria-label={t('installPrompt')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block align-middle ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{t('installPrompt')}</span>
            </button>
        </div>
      )}
      <main className="flex-grow flex flex-col items-center justify-center p-4 pt-0 w-full max-w-4xl mx-auto">
        <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-purple-900/20 p-6 md:p-8 border border-purple-500/20">
          <PromptForm
            prompt={prompt}
            setPrompt={setPrompt}
            handleSubmit={handleSubmit}
            isLoading={isLoading || isUpscaling}
            isPromptLoading={isPromptLoading}
            onEnhance={handleEnhancePrompt}
            onSuggest={handleSuggestPrompt}
            baseImage={baseImage}
            setBaseImage={setBaseImage}
            aspectRatio={aspectRatio}
            setAspectRatio={setAspectRatio}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            t={t}
          />
          <ImageDisplay
            imageUrl={imageUrl}
            isLoading={isLoading}
            isUpscaling={isUpscaling}
            error={error}
            prompt={lastGeneratedPrompt}
            onUpscale={handleUpscale}
            onSelectPrompt={setPrompt}
            t={t}
          />
        </div>
      </main>
      <Footer t={t}/>
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        history={history}
        onSelect={handleSelectFromHistory}
        onClear={handleClearHistory}
        t={t}
      />
    </div>
  );
};

export default App;