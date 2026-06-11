import MenuIcon from '../MenuIcon/MenuIcon.jsx';
import { useNavbarContext } from "../../useNavbarContext";
import './Menu.css';

export const Menu = () => {
    const { isOpen } = useNavbarContext();

    return (
        <div className={`menu ${isOpen ? "menu-open" : ""}`}>
            <MenuItems />
        </div>
    );
};

const MenuItems = () => {
    const { setIsOpen } = useNavbarContext();

    return (
        <>
            <div className="menu-header">
            </div>
            
            <a href="/" onClick={() => setIsOpen(false)}>Inicio</a>
            <a href="/login" onClick={() => setIsOpen(false)}>Ingresar</a>
            <a href="/signup" onClick={() => setIsOpen(false)}>Registrar</a>
        </>
    );
};

export const MenuToggle = () => {
    return <MenuIcon />;
};
