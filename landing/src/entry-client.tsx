import React from 'react';
import ReactDOM from 'react-dom/client';

declare global {
  interface Window {
    __APP_URL__?: string;
  }
}

type PageModule = {
  default: React.ComponentType<{ appUrl?: string }>;
};

const pages = import.meta.glob('./pages/**/*.page.tsx', { eager: true });

const appUrlFromWindow: string = window.__APP_URL__ ?? 'http://localhost:3000';

(async () => {
  const url = window.location.pathname === '/' ? '/index' : window.location.pathname;
  const key = `./pages${url}.page.tsx`;
  const mod = (pages as Record<string, PageModule>)[key];
  const Page = mod?.default ?? (() => <div>Default Page</div>);

  const root = document.getElementById('root');

  if (!root) {
    throw new Error('Could not find root element');
  }

  ReactDOM.hydrateRoot(root, <Page appUrl={appUrlFromWindow} />);
})();
