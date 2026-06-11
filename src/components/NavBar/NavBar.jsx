import { FaBars, FaMagnifyingGlass, FaRightToBracket, FaSatelliteDish } from 'react-icons/fa6'
import './Navbar.css'

export default function Navbar({ telemetryMessage, isPreviewData }) {
  return (
    <header className="mission-navbar">
      <a className="mission-navbar__brand" href="/" aria-label="SCORPIO home">
        <span className="mission-navbar__logo" aria-hidden="true">S</span>
        <span>SCORPIO</span>
      </a>

      <div className="mission-navbar__telemetry" role="status" aria-live="polite">
        <span className={`mission-navbar__pulse ${isPreviewData ? 'mission-navbar__pulse--preview' : ''}`} />
        <span>{telemetryMessage}</span>
      </div>

      <nav className="mission-navbar__actions" aria-label="Primary navigation">
        <button type="button" aria-label="Search">
          <FaMagnifyingGlass />
        </button>
        <button type="button" aria-label="Stations">
          <FaSatelliteDish />
        </button>
        <a href="/login" aria-label="Login">
          <FaRightToBracket />
        </a>
        <button type="button" aria-label="Menu">
          <FaBars />
        </button>
      </nav>
    </header>
  )
}
