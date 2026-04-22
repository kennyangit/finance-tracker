import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransactionProvider } from './store/transactionStore';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/global.css';

type Page = 'dashboard' | 'transactions';

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    )
  },
  {
    id: 'transactions',
    label: 'Transações',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <polyline points="7 23 3 19 7 15" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    )
  }
];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.15, ease: 'easeIn' }
  }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'transactions' || hash === 'dashboard') {
        setCurrentPage(hash as Page);
      } else if (hash === '') {
        setCurrentPage('dashboard');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: Page) => {
    window.location.hash = page;
  };

  return (
    <TransactionProvider>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg)'
      }}>
        {/* Desktop Top Header */}
        {!isMobile && (
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-subtle)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '1400px',
            }}>
              <nav style={{
                display: 'flex',
                gap: '0.25rem',
                background: 'var(--bg)',
                padding: '0.25rem',
                borderRadius: '0.75rem',
              }}>
                {navItems.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: isActive ? 'var(--primary)' : 'transparent',
                        color: isActive ? 'white' : 'var(--text-secondary)',
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 150ms ease',
                      }}
                      whileHover={!isActive ? { backgroundColor: 'rgba(124, 58, 237, 0.1)' } : {}}
                      whileTap={{ scale: 0.96 }}
                    >
                      {item.icon}
                      {item.label}
                    </motion.button>
                  );
                })}
              </nav>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main style={{
          flex: 1,
          maxWidth: '1400px',
          width: '100%',
          margin: '0 auto',
          paddingBottom: isMobile ? '80px' : '0',
        }}>
          <ErrorBoundary>
            <AnimatePresence mode="wait">
              {currentPage === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Dashboard />
                </motion.div>
              )}
              {currentPage === 'transactions' && (
                <motion.div
                  key="transactions"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                >
                  <Transactions />
                </motion.div>
              )}
            </AnimatePresence>
          </ErrorBoundary>
        </main>

        {/* Mobile Bottom Tab Bar */}
        {isMobile && (
          <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            background: 'var(--bg-subtle)',
            borderTop: '1px solid var(--border)',
            zIndex: 1000,
            paddingBottom: 'env(safe-area-inset-bottom)',
            height: '60px',
          }}>
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.2rem',
                    padding: '0.5rem',
                    border: 'none',
                    background: 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-tertiary)',
                    fontSize: '0.7rem',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              );
            })}
          </nav>
        )}
      </div>
    </TransactionProvider>
  );
}
