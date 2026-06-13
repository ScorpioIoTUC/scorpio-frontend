import { FaMagnifyingGlass, FaRightToBracket } from 'react-icons/fa6'
import './Navbar.css'
import { useState } from 'react'
import { Menu, MenuToggle } from './elements/Menu/Menu.jsx'
import { FilterSidebar } from './elements/FilterSidebar/FilterSidebar.jsx'
import { NavbarProvider } from './NavbarContext.jsx'

export default function Navbar({ stations = [], selectedStationIds = [], onSelectedStationIdsChange }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  return (
    <NavbarProvider>
      <header className="mission-navbar">
        <a
          className="mission-navbar__brand"
          href="/"
          aria-label="SCORPIO home"
        >
          <span>SCORPIO</span>
        </a>
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
        stations={stations}
        selectedStationIds={selectedStationIds}
        onSelectedStationIdsChange={onSelectedStationIdsChange}
      />
    </NavbarProvider>
  )
}
