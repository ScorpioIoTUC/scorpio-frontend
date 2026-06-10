import { useState } from 'react';
import './NavBar.css';
import { NavbarProvider } from './NavbarContext.jsx';
import { Menu, MenuToggle } from './elements/Menu/Menu.jsx';
import { FilterSidebar } from './elements/FilterSidebar/FilterSidebar.jsx';
import { FaMagnifyingGlass } from "react-icons/fa6";


function NavBar() {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    return (
        <NavbarProvider>
            <div className='navbar'>
                <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', flexGrow: 1 }}>
                    IoT-UC
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Abrir filtros"
                    >
                        <FaMagnifyingGlass size={30} color="white" />
                    </div>
                    <MenuToggle />
                </div>
            </div>

            <Menu />

            <FilterSidebar
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />
        </NavbarProvider>
    );
}

export default NavBar;