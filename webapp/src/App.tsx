import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Package, CloudSun, Menu, X, BarChart3, Footprints } from 'lucide-react';
import { HikePlanner } from './components/HikePlanner';
import { ResupplyPlanner } from './components/ResupplyPlanner';
import { WeatherForecast } from './components/weather/WeatherForecast';
import { TrailProgress } from './components/TrailProgress';
import { ThemeToggle } from './components/ui';
import { cn } from './lib/utils';
import './index.css';

type Tab = 'planner' | 'resupply' | 'weather';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'planner', label: 'Planner', icon: <Map className="w-4 h-4" /> },
  { id: 'resupply', label: 'Resupply', icon: <Package className="w-4 h-4" /> },
  { id: 'weather', label: 'Weather', icon: <CloudSun className="w-4 h-4" /> },
];

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.2 }
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('planner');
  const [currentMile, setCurrentMile] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-sm">
                <Footprints className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight leading-tight">AT Thru-Hike Planner</h1>
                <p className="text-[11px] text-[var(--foreground-muted)] leading-tight">Appalachian Trail</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-1 bg-[var(--background-secondary)] rounded-lg p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all',
                      activeTab === tab.id
                        ? 'bg-[var(--primary)] text-white shadow-sm'
                        : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                    )}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
              <ThemeToggle />
            </nav>

            {/* Mobile: Theme Toggle + Menu Button */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn-ghost p-2 rounded-lg"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden mt-3 overflow-hidden"
              >
                <div className="flex flex-col gap-0.5 bg-[var(--background-secondary)] rounded-lg p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all',
                        activeTab === tab.id
                          ? 'bg-[var(--primary)] text-white'
                          : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                      )}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-8 py-5">
        <AnimatePresence mode="wait">
          {activeTab === 'planner' && (
            <motion.div key="planner" {...pageTransition}>
              <HikePlanner initialMile={currentMile} onMileChange={setCurrentMile} />
            </motion.div>
          )}

          {activeTab === 'resupply' && (
            <motion.div key="resupply" {...pageTransition}>
              <ResupplyPlanner currentMile={currentMile} onMileChange={setCurrentMile} />
            </motion.div>
          )}

          {activeTab === 'weather' && (
            <motion.div key="weather" {...pageTransition}>
              <WeatherForecast currentMile={currentMile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-8 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <button
            onClick={() => setShowStats(!showStats)}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-3"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Trail Stats
          </button>

          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <TrailProgress />
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-xs text-[var(--foreground-muted)]">
            AT Thru-Hike Planner · 2,197.9 miles from Springer Mountain, GA to Mt. Katahdin, ME
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-1.5 opacity-70">
            © 2026 BigFunHikes.com · Always verify content beforehand!
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
