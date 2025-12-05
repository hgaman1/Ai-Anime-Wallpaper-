import React from 'react';

interface FooterProps {
  t: (key: string) => string;
}

export const Footer: React.FC<FooterProps> = ({ t }) => {
  const hassanGamilLink = (
    <a
      href="https://www.facebook.com/hassan.gamil.77"
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-purple-400 hover:text-purple-300"
    >
      Hassan Gamil
    </a>
  );

  const footerText = t('footerText');
  const textParts = footerText.split('{hassanGamilLink}');

  return (
    <footer className="text-center p-6 text-gray-500 text-sm">
      <p className="mb-2">
        {textParts[0]}
        {hassanGamilLink}
        {textParts[1]}
      </p>
      <div className="flex justify-center items-center space-x-4" dir="ltr">
        <a
          href="https://www.instagram.com/ai.bel3arbi/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-pink-400 transition-colors"
        >
          Ai bel3arby - Instagram
        </a>
        <span>|</span>
        <a
          href="https://www.facebook.com/profile.php?id=100092947833541"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-400 transition-colors"
        >
          Ai bel3arby - Facebook
        </a>
      </div>
    </footer>
  );
};