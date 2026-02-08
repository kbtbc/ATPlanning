import { useState } from 'react';
import { MapPin, Navigation, Mountain, Search, Loader2, ChevronRight, Crosshair } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * 5 Mockup Concepts for Weather Location Picker
 * These are visual-only mockups — not wired to real data.
 */

type MockMode = 'mile' | 'waypoint' | 'gps';

// ─── MOCKUP A: "Unified Search Bar" ────────────────────────
// One smart input that handles everything. Type a mile number, shelter name, or tap GPS.
// Inspired by Spotlight / command palette patterns.
function MockupA() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const showResults = focused && query.length > 0;
  const isNumeric = /^\d+(\.\d+)?$/.test(query.trim());

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-5 py-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-3 text-center">
        Set your location by Trail Mile or Shelter Name, or use GPS
      </p>

      <div className="flex items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground-muted)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Mile number or shelter name..."
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        {/* GPS button - outside the input */}
        <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-xs font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-colors shrink-0">
          <Navigation className="w-3.5 h-3.5" />
          GPS
        </button>
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden shadow-sm">
          {isNumeric ? (
            <button className="w-full text-left px-3.5 py-2.5 hover:bg-[var(--background-secondary)] transition-colors flex items-center gap-3">
              <Mountain className="w-4 h-4 text-[var(--accent)]" />
              <div>
                <span className="text-xs font-medium text-[var(--foreground)]">Mile {query}</span>
                <span className="text-[10px] text-[var(--foreground-muted)] ml-2">3,200 ft elev</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--foreground-muted)] ml-auto" />
            </button>
          ) : (
            <>
              {['Neel Gap', 'Neels Gap Hostel', 'Near Blood Mountain'].map((name, i) => (
                <button key={i} className="w-full text-left px-3.5 py-2.5 hover:bg-[var(--background-secondary)] transition-colors flex items-center gap-3 border-t border-[var(--border-light)] first:border-0">
                  <MapPin className="w-4 h-4 text-[var(--accent)]" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-[var(--foreground)]">{name}</span>
                    <span className="text-[10px] text-[var(--foreground-muted)] ml-2">mi {30.7 + i * 2}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MOCKUP B: "Minimal Inline Strip" ────────────────────────
// Everything in one tight horizontal row. Mode icon buttons on the left,
// contextual input in the middle, action on the right.
function MockupB() {
  const [mode, setMode] = useState<MockMode>('mile');

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl p-3">
      <div className="flex items-center gap-2">
        {/* Mode selectors as icon-only pills */}
        <div className="flex gap-0.5 shrink-0">
          {([
            { m: 'mile' as MockMode, icon: Mountain, tip: 'Trail mile' },
            { m: 'waypoint' as MockMode, icon: MapPin, tip: 'Shelter' },
            { m: 'gps' as MockMode, icon: Navigation, tip: 'GPS' },
          ]).map(({ m, icon: Icon, tip }) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              title={tip}
              className={cn(
                'p-2 rounded-lg transition-all',
                mode === m
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--foreground-muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Contextual input */}
        {mode === 'mile' && (
          <>
            <input
              type="number"
              defaultValue="0"
              placeholder="Mile"
              className="flex-1 min-w-0 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
            <button className="btn btn-primary py-1.5 px-4 text-xs shrink-0">Go</button>
          </>
        )}
        {mode === 'waypoint' && (
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search shelter or town..."
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        )}
        {mode === 'gps' && (
          <button className="flex-1 flex items-center justify-center gap-2 bg-[var(--background)] border border-[var(--border)] rounded-lg py-1.5 text-xs text-[var(--foreground-muted)] hover:border-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
            <Crosshair className="w-3.5 h-3.5" />
            Use current location
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MOCKUP C: "Segmented Field" ────────────────────────
// The mode toggle IS the input container. Each segment expands when active.
// Feels like one integrated control rather than toggle + separate input.
function MockupC() {
  const [mode, setMode] = useState<MockMode>('mile');

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-3.5">
      <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2.5 text-center">
        Set your location
      </p>

      <div className="flex gap-1.5">
        {/* Mile segment */}
        <button
          onClick={() => setMode('mile')}
          className={cn(
            'rounded-lg transition-all overflow-hidden flex items-center',
            mode === 'mile'
              ? 'flex-[3] bg-[var(--background)] border border-[var(--primary)]/40 shadow-sm'
              : 'flex-1 bg-[var(--background)] border border-[var(--border)] hover:border-[var(--border-light)]'
          )}
        >
          {mode === 'mile' ? (
            <div className="flex items-center gap-2 w-full px-3 py-2">
              <Mountain className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <input
                type="number"
                defaultValue="0"
                placeholder="Mile #"
                className="flex-1 min-w-0 bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none"
                onClick={e => e.stopPropagation()}
              />
              <span className="text-[10px] font-semibold text-[var(--primary)] shrink-0 cursor-pointer hover:underline">Go</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-2 gap-0.5">
              <Mountain className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
              <span className="text-[10px] text-[var(--foreground-muted)]">Mile</span>
            </div>
          )}
        </button>

        {/* Shelter segment */}
        <button
          onClick={() => setMode('waypoint')}
          className={cn(
            'rounded-lg transition-all overflow-hidden flex items-center',
            mode === 'waypoint'
              ? 'flex-[3] bg-[var(--background)] border border-[var(--primary)]/40 shadow-sm'
              : 'flex-1 bg-[var(--background)] border border-[var(--border)] hover:border-[var(--border-light)]'
          )}
        >
          {mode === 'waypoint' ? (
            <div className="flex items-center gap-2 w-full px-3 py-2">
              <Search className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
              <input
                type="text"
                placeholder="Search shelter or town..."
                className="flex-1 min-w-0 bg-transparent text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none"
                onClick={e => e.stopPropagation()}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-2 gap-0.5">
              <MapPin className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
              <span className="text-[10px] text-[var(--foreground-muted)]">Shelter</span>
            </div>
          )}
        </button>

        {/* GPS segment */}
        <button
          onClick={() => setMode('gps')}
          className={cn(
            'rounded-lg transition-all overflow-hidden flex items-center justify-center',
            mode === 'gps'
              ? 'flex-[2] bg-[var(--primary)] text-white shadow-sm'
              : 'flex-1 bg-[var(--background)] border border-[var(--border)] hover:border-[var(--border-light)]'
          )}
        >
          {mode === 'gps' ? (
            <div className="flex items-center gap-2 px-3 py-2">
              <Navigation className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Locating...</span>
              <Loader2 className="w-3 h-3 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-2 gap-0.5">
              <Navigation className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
              <span className="text-[10px] text-[var(--foreground-muted)]">GPS</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── MOCKUP D: "Stacked Cards" ────────────────────────
// Three small tappable cards stacked vertically, each self-contained.
// Whichever you tap becomes the active one and expands its input.
// Clean and obvious — zero learning curve.
function MockupD() {
  const [active, setActive] = useState<MockMode>('mile');

  const options: { mode: MockMode; icon: typeof Mountain; label: string; desc: string }[] = [
    { mode: 'mile', icon: Mountain, label: 'Trail Mile', desc: 'Enter a mile marker' },
    { mode: 'waypoint', icon: MapPin, label: 'Shelter / Town', desc: 'Search by name' },
    { mode: 'gps', icon: Navigation, label: 'GPS Location', desc: 'Use your current position' },
  ];

  return (
    <div className="space-y-1.5">
      {options.map(({ mode, icon: Icon, label, desc }) => {
        const isActive = active === mode;
        return (
          <div
            key={mode}
            onClick={() => setActive(mode)}
            className={cn(
              'rounded-xl border transition-all cursor-pointer',
              isActive
                ? 'bg-[var(--background-secondary)] border-[var(--primary)]/30 shadow-sm'
                : 'bg-[var(--background-secondary)] border-[var(--border)] hover:border-[var(--border-light)]'
            )}
          >
            <div className="flex items-center gap-3 px-4 py-2.5">
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                isActive ? 'bg-[var(--primary)]/15' : 'bg-[var(--background)]'
              )}>
                <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[var(--primary)]' : 'text-[var(--foreground-muted)]')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-medium', isActive ? 'text-[var(--foreground)]' : 'text-[var(--foreground-muted)]')}>{label}</p>
                <p className="text-[10px] text-[var(--foreground-muted)]">{desc}</p>
              </div>
              {isActive && mode !== 'gps' && (
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
              )}
            </div>

            {/* Expanded content */}
            {isActive && mode === 'mile' && (
              <div className="px-4 pb-3 pt-0.5 flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="0"
                  className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  onClick={e => e.stopPropagation()}
                />
                <button className="btn btn-primary py-1.5 px-4 text-xs">Go</button>
              </div>
            )}
            {isActive && mode === 'waypoint' && (
              <div className="px-4 pb-3 pt-0.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--foreground-muted)]" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary)]"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            {isActive && mode === 'gps' && (
              <div className="px-4 pb-3 pt-0.5">
                <button className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white rounded-lg py-2 text-xs font-medium hover:opacity-90 transition-opacity">
                  <Crosshair className="w-3.5 h-3.5" />
                  Detect my location
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MOCKUP E: "Floating Toolbar" ────────────────────────
// Ultra-compact: a single unified input with mode as a prefix dropdown.
// Like a URL bar with a protocol selector. Maximum information density.
function MockupE() {
  const [mode, setMode] = useState<MockMode>('mile');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const modeConfig = {
    mile: { icon: Mountain, label: 'Mile', placeholder: 'Enter trail mile...' },
    waypoint: { icon: MapPin, label: 'Shelter', placeholder: 'Search shelter or town...' },
    gps: { icon: Navigation, label: 'GPS', placeholder: 'Detecting location...' },
  };

  const current = modeConfig[mode];

  return (
    <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl px-4 py-3.5">
      <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] font-semibold mb-2.5 text-center">
        Set your location by Trail Mile, Shelter, or GPS
      </p>

      <div className="relative flex items-center bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden focus-within:border-[var(--primary)] transition-colors">
        {/* Mode selector prefix */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 border-r border-[var(--border)] bg-[var(--background-secondary)]/50 hover:bg-[var(--background-secondary)] transition-colors shrink-0"
          >
            <current.icon className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="text-[11px] font-medium text-[var(--foreground)]">{current.label}</span>
            <ChevronRight className={cn('w-3 h-3 text-[var(--foreground-muted)] transition-transform', dropdownOpen && 'rotate-90')} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-36 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-md overflow-hidden z-10">
              {Object.entries(modeConfig).map(([key, { icon: Icon, label }]) => (
                <button
                  key={key}
                  onClick={() => { setMode(key as MockMode); setDropdownOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors',
                    mode === key
                      ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium'
                      : 'text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] hover:text-[var(--foreground)]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input area */}
        {mode === 'gps' ? (
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Use my current location</span>
          </button>
        ) : (
          <>
            <input
              type={mode === 'mile' ? 'number' : 'text'}
              placeholder={current.placeholder}
              className="flex-1 min-w-0 px-3 py-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] bg-transparent focus:outline-none"
            />
            {mode === 'mile' && (
              <button className="px-3.5 py-1.5 mr-1.5 rounded-lg bg-[var(--primary)] text-white text-[11px] font-medium hover:opacity-90 transition-opacity shrink-0">
                Go
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}


// ─── MOCKUPS PAGE ────────────────────────
export function WeatherPickerMockups() {
  return (
    <div className="space-y-8 py-2">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Weather Location Picker — 5 Concepts</h2>
        <p className="text-xs text-[var(--foreground-muted)] mt-1">
          Click around to interact. These are visual mockups only.
        </p>
      </div>

      {/* A */}
      <section>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)]">A</span>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Unified Search Bar</h3>
          <span className="text-[10px] text-[var(--foreground-muted)]">— One smart input that handles miles, shelter names, and GPS</span>
        </div>
        <MockupA />
      </section>

      {/* B */}
      <section>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)]">B</span>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Minimal Inline Strip</h3>
          <span className="text-[10px] text-[var(--foreground-muted)]">— Icon toggles + contextual input, all in one row</span>
        </div>
        <MockupB />
      </section>

      {/* C */}
      <section>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)]">C</span>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Segmented Field</h3>
          <span className="text-[10px] text-[var(--foreground-muted)]">— Toggle IS the input. Active segment expands.</span>
        </div>
        <MockupC />
      </section>

      {/* D */}
      <section>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)]">D</span>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Stacked Cards</h3>
          <span className="text-[10px] text-[var(--foreground-muted)]">— Tap to expand. Zero learning curve.</span>
        </div>
        <MockupD />
      </section>

      {/* E */}
      <section>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--primary)]">E</span>
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Floating Toolbar</h3>
          <span className="text-[10px] text-[var(--foreground-muted)]">— URL-bar style: prefix dropdown + input. Maximum density.</span>
        </div>
        <MockupE />
      </section>
    </div>
  );
}
