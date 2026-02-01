import { useState, useMemo } from 'react'
import waypoints from './data/at_waypoints.json'
import { calculateETA, findNearestWaypoint } from './utils/calculations'
import { format, addDays } from 'date-fns'
import './App.css'

function App() {
  const [currentMile, setCurrentMile] = useState(0)
  const [pace, setPace] = useState(15) // Default 15 mpd
  const [startDate, setStartDate] = useState(new Date())
  const [resupplyList, setResupplyList] = useState(new Set())

  // Memoize the calculated data to avoid recalculating on every render if not needed
  const plan = useMemo(() => {
    return waypoints.map(wp => {
      const eta = calculateETA(currentMile, wp.mile, pace, startDate)
      const distFromUser = wp.mile - currentMile
      return {
        ...wp,
        eta,
        distFromUser,
        isResupply: resupplyList.has(wp.name)
      }
    }).filter(wp => wp.distFromUser >= -5) // Show points slightly behind for context, mostly ahead
    .sort((a, b) => a.mile - b.mile)
  }, [currentMile, pace, startDate, resupplyList])

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const nearest = findNearestWaypoint(latitude, longitude, waypoints)
        if (nearest) {
          setCurrentMile(nearest.mile)
          alert(`Located near ${nearest.name} (Mile ${nearest.mile})`)
        }
      },
      (error) => {
        alert('Unable to retrieve your location')
        console.error(error)
      }
    )
  }

  const toggleResupply = (name) => {
    const newSet = new Set(resupplyList)
    if (newSet.has(name)) {
      newSet.delete(name)
    } else {
      newSet.add(name)
    }
    setResupplyList(newSet)
  }

  return (
    <div className="container">
      <header className="header">
        <h1>AT Thru-Hike Planner</h1>
        <p>Plan your resupplies and track your progress.</p>
      </header>

      <section className="controls">
        <div className="control-group">
          <label>Current Mile:</label>
          <input
            type="number"
            value={currentMile}
            onChange={(e) => setCurrentMile(parseFloat(e.target.value))}
            step="0.1"
          />
          <button onClick={handleGeolocation}>📍 Locate Me</button>
        </div>

        <div className="control-group">
          <label>Pace (mi/day):</label>
          <input
            type="number"
            value={pace}
            onChange={(e) => setPace(parseFloat(e.target.value))}
          />
          <div className="presets">
            <button onClick={() => setPace(12)}>12</button>
            <button onClick={() => setPace(15)}>15</button>
            <button onClick={() => setPace(18)}>18</button>
            <button onClick={() => setPace(22)}>22</button>
          </div>
        </div>

        <div className="control-group">
          <label>Plan Start Date:</label>
          <input
            type="date"
            value={format(startDate, 'yyyy-MM-dd')}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split('-').map(Number);
              setStartDate(new Date(y, m - 1, d));
            }}
          />
        </div>
      </section>

      <section className="resupply-summary">
        <h2>Upcoming Resupplies (Next 7 Days)</h2>
        <div className="cards">
            {plan.filter(wp => wp.isResupply && wp.distFromUser > 0 && wp.eta <= addDays(startDate, 8)).length === 0 ? <p>No resupplies planned for the next week.</p> : null}
            {plan.filter(wp => wp.isResupply && wp.distFromUser > 0 && wp.eta <= addDays(startDate, 8)).map(wp => (
              <div key={wp.name} className="card resupply-card">
                <h3>{wp.name}</h3>
                <p>Mile: {wp.mile}</p>
                <p>ETA: {format(wp.eta, 'EEE, MMM d')}</p>
              </div>
            ))}
        </div>
      </section>

      <section className="waypoint-list">
        <h2>Trail Waypoints</h2>
        <table>
          <thead>
            <tr>
              <th>Mile</th>
              <th>Name</th>
              <th>Type</th>
              <th>Amenities</th>
              <th>Dist</th>
              <th>ETA</th>
              <th>Resupply</th>
            </tr>
          </thead>
          <tbody>
            {plan.map(wp => (
              <tr key={wp.name} className={wp.distFromUser < 0 ? 'passed' : ''}>
                <td>{wp.mile.toFixed(1)}</td>
                <td>{wp.name}</td>
                <td>{wp.type}</td>
                <td>{wp.amenities?.join(', ')}</td>
                <td>{wp.distFromUser.toFixed(1)}</td>
                <td>{format(wp.eta, 'MMM d')}</td>
                <td>
                  {(wp.type === 'Town' || wp.amenities.includes('Resupply')) && (
                    <input
                      type="checkbox"
                      checked={wp.isResupply}
                      onChange={() => toggleResupply(wp.name)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App
