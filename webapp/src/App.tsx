import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mountain, Map, Package, Search, Navigation, Menu, X, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { LocationPanel } from './components/LocationPanel';
import { HikePlanner } from './components/HikePlanner';
import { WaypointList } from './components/WaypointList';
import { ResupplyPlanner } from './components/ResupplyPlanner';
import { TrailProgress } from './components/TrailProgress';
import { cn } from './lib/utils';
import './index.css';

type Tab = 'location' | 'planner' | 'resupply' | 'waypoints';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'location', label: 'Location', icon: <Navigation className="w-5 h-5" /> },
  { id: 'planner', label: 'Planner', icon: <Map className="w-5 h-5" /> },
  { id: 'resupply', label: 'Resupply', icon: <Package className="w-5 h-5" /> },
  { id: 'waypoints', label: 'Waypoints', icon: <Search className="w-5 h-5" /> },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('location');
  const [currentMile, setCurrentMile] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLocationFound = (mile: number) => {
    setCurrentMile(mile);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">AT Thru-Hike Planner</h1>
                <p className="text-xs text-[var(--foreground-muted)]">Appalachian Trail Route & Resupply</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-[var(--background-secondary)] rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--background-secondary)]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-4 overflow-hidden"
              >
                <div className="flex flex-col gap-1 bg-[var(--background-secondary)] rounded-xl p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
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
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className={cn(
          "grid grid-cols-1 gap-6 transition-all duration-300",
          sidebarCollapsed ? "lg:grid-cols-1" : "lg:grid-cols-3"
        )}>
          {/* Left Column - Trail Overview (collapsible on desktop) */}
          <aside className={cn(
            "hidden lg:block transition-all duration-300",
            sidebarCollapsed && "lg:hidden"
          )}>
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-[var(--foreground-muted)]">Trail Stats</h3>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1.5 rounded-lg hover:bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                  title="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              <TrailProgress />

              {/* Quick Stats */}
              {currentMile > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-xl p-5 text-white"
                >
                  <p className="text-sm opacity-80">Your Position</p>
                  <p className="text-3xl font-bold mt-1">Mile {currentMile.toFixed(1)}</p>
                  <p className="text-sm opacity-80 mt-2">
                    {(2197.4 - currentMile).toFixed(1)} miles to Katahdin
                  </p>
                </motion.div>
              )}
            </div>
          </aside>

          {/* Collapsed Sidebar Toggle */}
          {sidebarCollapsed && (
            <div className="hidden lg:block fixed left-4 top-24 z-30">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--accent)] text-sm font-medium transition-all shadow-sm"
                title="Show trail stats"
              >
                <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Main Content Area */}
          <div className={cn(
            "transition-all duration-300",
            sidebarCollapsed ? "lg:col-span-1" : "lg:col-span-2"
          )}>
            <AnimatePresence mode="wait">
              {activeTab === 'location' && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="lg:hidden">
                    <TrailProgress />
                  </div>
                  <LocationPanel onLocationFound={handleLocationFound} />

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('planner')}
                      className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left"
                    >
                      <Map className="w-8 h-8 text-[var(--accent)] mb-2" />
                      <h3 className="font-medium">Plan Your Hike</h3>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        Create daily itineraries
                      </p>
                    </button>
                    <button
                      onClick={() => setActiveTab('resupply')}
                      className="p-4 rounded-xl bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--accent)] transition-all text-left"
                    >
                      <Package className="w-8 h-8 text-[var(--secondary)] mb-2" />
                      <h3 className="font-medium">Find Resupply</h3>
                      <p className="text-sm text-[var(--foreground-muted)]">
                        Towns & stores ahead
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'planner' && (
                <motion.div
                  key="planner"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <HikePlanner initialMile={currentMile} expanded={sidebarCollapsed} />
                </motion.div>
              )}

              {activeTab === 'resupply' && (
                <motion.div
                  key="resupply"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ResupplyPlanner currentMile={currentMile} />
                </motion.div>
              )}

              {activeTab === 'waypoints' && (
                <motion.div
                  key="waypoints"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WaypointList />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-[var(--foreground-muted)]">
          <p>
            AT Thru-Hike Planner · 2,197.4 miles from Springer Mountain, GA to Mt. Katahdin, ME
          </p>
          <p className="mt-2">
            Data compiled from multiple sources. Always verify with current guidebooks and local conditions.
          </p>
          <p className="mt-4 text-xs">
            Not affiliated with the Appalachian Trail Conservancy. For informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
