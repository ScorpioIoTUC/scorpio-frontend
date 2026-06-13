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
    return (
        <>
            <div className="menu-section">
                <h3>Cuenta</h3>
                <a href="/login">Login</a>
                <a href="/signup">Register</a>
            </div>
        </>
    );
};

export const MenuToggle = () => {
    return <MenuIcon />;
};
