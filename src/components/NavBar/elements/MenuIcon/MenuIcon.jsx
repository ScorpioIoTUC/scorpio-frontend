import './MenuIcon.css';
import { useNavbarContext } from "../../useNavbarContext";

function MenuIcon() {
    const { isOpen, setIsOpen } = useNavbarContext();
    const navToggle = () => {
        setIsOpen(!isOpen);
    };
    return (
        <div onClick={navToggle} className={`nav__toggler ${isOpen ? "toggle" : ""}`}>
            <div className="line1"></div>
            <div className="line2"></div>
            <div className="line3"></div>
        </div>

    )
}

export default MenuIcon
