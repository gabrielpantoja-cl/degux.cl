import Document, { Html, Head, Main, NextScript } from 'next/document';
import fs from 'fs';
import path from 'path';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    // Leer el contenido del archivo critical.css
    const criticalCSS = fs.readFileSync(
      path.resolve(__dirname, '../public/critical.css'),
      'utf8'
    );

    return { ...initialProps, criticalCSS };
  }

  render() {
    const { criticalCSS } = this.props;

    return (
      <Html lang="en">
        <Head>
          <style
            dangerouslySetInnerHTML={{ __html: criticalCSS }}
          />
          <link
            rel="preload"
            href="/_next/static/media/c556ae4be4c9cfa8-s.p.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/_next/static/media/ebd7dc65a6ba3e83-s.p.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/_next/static/media/a34f9d1faa5f3315-s.p.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />
        </Head>
        <body className="antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;