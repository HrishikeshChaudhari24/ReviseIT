import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'ReviseIt — AI-Powered Spaced Repetition',
  description: 'Make revision effortless and fun with AI-generated inshorts and spaced repetition scheduling.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
