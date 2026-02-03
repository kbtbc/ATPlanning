import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Map, Package, Search, Navigation, Menu, X, BarChart3 } from 'lucide-react';
import { LocationPanel } from './components/LocationPanel';
import { HikePlanner } from './components/HikePlanner';
import { WaypointList } from './components/WaypointList';
import { ResupplyPlanner } from './components/ResupplyPlanner';
import { TrailProgress } from './components/TrailProgress';
import { cn } from './lib/utils';
import './index.css';

type Tab = 'location' | 'planner' | 'resupply' | 'waypoints' | 'stats';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'location', label: 'Location', icon: <Navigation className="w-4 h-4" /> },
  { id: 'planner', label: 'Planner', icon: <Map className="w-4 h-4" /> },
  { id: 'resupply', label: 'Resupply', icon: <Package className="w-4 h-4" /> },
  { id: 'waypoints', label: 'Waypoints', icon: <Search className="w-4 h-4" /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
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

  const handleLocationFound = (mile: number) => {
    setCurrentMile(mile);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center shadow-sm">
                <Mountain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight leading-tight">AT Thru-Hike Planner</h1>
                <p className="text-[11px] text-[var(--foreground-muted)] leading-tight">Appalachian Trail</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-0.5 bg-[var(--background-secondary)] rounded-lg p-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden btn-ghost p-2 rounded-lg"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
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
      <main className="max-w-3xl mx-auto px-4 py-5">
        <AnimatePresence mode="wait">
          {activeTab === 'location' && (
            <motion.div key="location" {...pageTransition} className="space-y-5">
              <LocationPanel onLocationFound={handleLocationFound} />

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('planner')}
                  className="panel p-4 text-left hover:border-[var(--accent)] transition-colors"
                >
                  <Map className="w-7 h-7 text-[var(--accent)] mb-2" />
                  <h3 className="font-medium text-sm">Plan Your Hike</h3>
                  <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    Create daily itineraries
                  </p>
                </button>
                <button
                  onClick={() => setActiveTab('resupply')}
                  className="panel p-4 text-left hover:border-[var(--accent)] transition-colors"
                >
                  <Package className="w-7 h-7 text-[var(--secondary)] mb-2" />
                  <h3 className="font-medium text-sm">Find Resupply</h3>
                  <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                    Towns & stores ahead
                  </p>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'planner' && (
            <motion.div key="planner" {...pageTransition}>
              <HikePlanner initialMile={currentMile} />
            </motion.div>
          )}

          {activeTab === 'resupply' && (
            <motion.div key="resupply" {...pageTransition}>
              <ResupplyPlanner currentMile={currentMile} />
            </motion.div>
          )}

          {activeTab === 'waypoints' && (
            <motion.div key="waypoints" {...pageTransition}>
              <WaypointList />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div key="stats" {...pageTransition}>
              <TrailProgress />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-8 py-6">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-[var(--foreground-muted)]">
            AT Thru-Hike Planner · 2,197.4 miles from Springer Mountain, GA to Mt. Katahdin, ME
          </p>
          <p className="text-[11px] text-[var(--foreground-muted)] mt-1.5 opacity-70">
            Not affiliated with the Appalachian Trail Conservancy. Always verify with current guidebooks.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
