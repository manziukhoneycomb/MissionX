import ReactDOMServer from 'react-dom/server';
import App from './App';

type PageModule = {
  default: React.ComponentType<{ appUrl?: string }>;
};

const pages = import.meta.glob('./pages/**/*.page.tsx', { eager: true });

export async function render(url: string, appUrl: string): Promise<string> {
  const key = `./pages${url}.page.tsx`;
  const mod = (pages as Record<string, PageModule>)[key];
  const Page = mod?.default ?? (() => <div>Default Page</div>);

  const html = ReactDOMServer.renderToString(
    <App>
      <Page appUrl={appUrl} />
    </App>,
  );

  return html;
}
