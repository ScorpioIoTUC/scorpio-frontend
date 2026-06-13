import { FaMagnifyingGlass, FaRightToBracket } from 'react-icons/fa6'
import './Navbar.css'
import { useState } from 'react'
import { Menu, MenuToggle } from './elements/Menu/Menu.jsx'
import { FilterSidebar } from './elements/FilterSidebar/FilterSidebar.jsx'
import { NavbarProvider } from './NavBarContext.jsx'

export default function Navbar() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <NavbarProvider>
      <header className="mission-navbar">
        <a
          className="mission-navbar__brand"
          href="/"
          aria-label="SCORPIO home"
        >
          {/* <span className="mission-navbar__logo" aria-hidden="true">
            S
          </span> */}
          <span>SCORPIO</span>
        </a>

        {/* <div
          className="mission-navbar__telemetry"
          role="status"
          aria-live="polite"
        >
          <span
            className={`mission-navbar__pulse ${isPreviewData ? 'mission-navbar__pulse--preview' : ''
              }`}
          />
          <span>{telemetryMessage}</span>
        </div> */}

        <nav
          className="mission-navbar__actions"
          aria-label="Primary navigation"
        >
          <button
            type="button"
            aria-label="Filters"
            onClick={() => setIsFilterOpen(true)}
          >
            <FaMagnifyingGlass />
          </button>
          <a href="/login" aria-label="Login">
            <FaRightToBracket />
          </a>
          <MenuToggle />
        </nav>
      </header>

      <Menu />

      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </NavbarProvider>
  )
}
