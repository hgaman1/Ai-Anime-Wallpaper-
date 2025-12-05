import React from 'react';

interface ImageDisplayProps {
  imageUrl: string | null;
  isLoading: boolean;
  isUpscaling: boolean;
  error: string | null;
  prompt: string;
  onUpscale: () => void;
  onSelectPrompt: (prompt: string) => void;
  t: (key: string) => string;
}

const LoadingSpinner: React.FC<{isUpscaling: boolean; t: (key: string) => string;}> = ({ isUpscaling, t }) => (
  <div className="text-center p-8">
    <div className="animate-pulse">
      <div className="text-2xl mb-4">{isUpscaling ? '✨' : '🎨'}</div>
      <p className="text-lg font-semibold text-purple-300">
        {isUpscaling ? t('upscalingTitle') : t('loadingTitle')}
        </p>
      <p className="text-gray-400">{t('loadingSubtitle')}</p>
    </div>
  </div>
);

const InitialState: React.FC<{t: (key: string) => string; onSelectPrompt: (p: string) => void}> = ({t, onSelectPrompt}) => {
  const samples = [
    {
      label: "One Piece",
      prompt: "One Piece Luffy Gear 5 epic anime wallpaper 8k sun god nika joyboy",
      url: "https://image.pollinations.ai/prompt/One%20Piece%20Luffy%20Gear%205%20epic%20anime%20wallpaper%208k%20detailed?width=400&height=600&nologo=true&seed=101"
    },
    {
      label: "Naruto",
      prompt: "Naruto Uzumaki Kurama Mode epic glow anime wallpaper 4k",
      url: "https://image.pollinations.ai/prompt/Naruto%20Uzumaki%20Kurama%20Link%20Mode%20orange%20glow%20anime%20wallpaper?width=400&height=600&nologo=true&seed=202"
    },
    {
      label: "Jujutsu Kaisen",
      prompt: "Gojo Satoru Hollow Purple eyes Jujutsu Kaisen anime wallpaper cinematic",
      url: "https://image.pollinations.ai/prompt/Gojo%20Satoru%20Hollow%20Purple%20Infinite%20Void%20Jujutsu%20Kaisen%20Anime?width=400&height=600&nologo=true&seed=303"
    },
    {
      label: "Demon Slayer",
      prompt: "Tanjiro Kamado Sun Breathing Hinokami Kagura Demon Slayer anime wallpaper",
      url: "https://image.pollinations.ai/prompt/Tanjiro%20Kamado%20Sun%20Breathing%20Fire%20Demon%20Slayer%20Kimetsu%20No%20Yaiba?width=400&height=600&nologo=true&seed=404"
    }
  ];

  return (
    <div className="w-full flex flex-col gap-4">
       <div className="text-center mb-2">
         <h3 className="text-xl font-semibold text-gray-300">{t('initialStateTitle')}</h3>
         <p className="text-gray-500 text-sm">{t('initialStateSubtitle')}</p>
       </div>
       
       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
         {samples.map((sample, idx) => (
           <div 
            key={idx} 
            className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 shadow-lg"
            onClick={() => onSelectPrompt(sample.prompt)}
           >
             <div className="aspect-[2/3] w-full bg-gray-800">
               <img 
                 src={sample.url} 
                 alt={sample.label} 
                 className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" 
                 loading="lazy"
               />
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
               <span className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-0.5">{sample.label}</span>
               <p className="text-white text-xs truncate opacity-80 group-hover:opacity-100">{t('uploadClick')}</p>
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  imageUrl,
  isLoading,
  isUpscaling,
  error,
  prompt,
  onUpscale,
  onSelectPrompt,
  t,
}) => {
  const isShareSupported = typeof navigator.share === 'function' && typeof navigator.canShare === 'function';
  
  const getFilename = () => {
    const baseName = prompt.substring(0, 30).replace(/\s+/g, '_') + '_wallpaper';
    if (imageUrl) {
        const mimeType = imageUrl.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
        const extension = mimeType.split('/')[1] ?? 'jpg';
        return `${baseName}.${extension}`;
    }
    return `${baseName}.jpg`;
  };

  const downloadFilename = getFilename();

  const dataUrlToFile = async (dataUrl: string, filename: string): Promise<File | null> => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (err) {
      console.error("Error converting data URL to file:", err);
      return null;
    }
  };

  const handleShare = async () => {
    if (!imageUrl || !isShareSupported) {
      alert(t('shareUnsupported'));
      return;
    }

    try {
      const file = await dataUrlToFile(imageUrl, downloadFilename);
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Ai Anime Wallpaper',
          text: `I created this amazing wallpaper with Ai Anime Wallpaper: "${prompt}"`,
          files: [file],
        });
      } else {
        alert(t('shareFileError'));
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
        alert(t('shareGenericError'));
      }
    }
  };

  return (
    <div className="mt-8 w-full min-h-[300px] flex items-center justify-center bg-gray-900/50 rounded-lg p-4 transition-all duration-300 border border-gray-800">
      {(isLoading || isUpscaling) && <LoadingSpinner isUpscaling={isUpscaling} t={t}/>}
      {error && !isLoading && !isUpscaling && (
        <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-lg w-full">
          <p className="font-bold text-lg">{t('errorTitle')}</p>
          <p>{error}</p>
        </div>
      )}
      {!isLoading && !isUpscaling && !error && imageUrl && (
        <div className="w-full flex flex-col items-center space-y-4">
          <img
            src={imageUrl}
            alt={prompt}
            className="max-w-full max-h-[60vh] rounded-lg shadow-2xl shadow-black ring-1 ring-purple-500/30"
          />
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={imageUrl}
              download={downloadFilename}
              className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{t('downloadButton')}</span>
            </a>
             <button
                onClick={onUpscale}
                className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isUpscaling}
              >
                ✨
                <span>{t('upscaleButton')}</span>
              </button>
            {isShareSupported && (
              <button
                onClick={handleShare}
                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span>{t('shareButton')}</span>
              </button>
            )}
          </div>
        </div>
      )}
      {!isLoading && !isUpscaling && !error && !imageUrl && <InitialState t={t} onSelectPrompt={onSelectPrompt}/>}
    </div>
  );
};