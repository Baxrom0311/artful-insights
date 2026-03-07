import Navbar from './Navbar';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
        {children}
      </main>
      <footer className="border-t border-border/70 bg-card/65">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-4 text-sm text-muted-foreground sm:px-6">
          <span>
            Created by:{' '}
            <a
              href="https://t.me/bakhromdev"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Bakhromdev
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
