import { useState } from 'react';
import './FilterSidebar.css';

export const FilterSidebar = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('name');

    return (
        <div className={`filter-sidebar ${isOpen ? "open" : ""}`}>
            <div className="filter-header">
                <button className="filter-close" type="button" onClick={onClose} aria-label="Cerrar filtros">
                    x
                </button>
            </div>

            <div className="filter-content">

                <div className="filter-section">
                    <div className="filter-title">Filtrar satelites</div>

                    <div className="filter-tabs">
                        <span
                            className={`tab ${activeTab === 'name' ? 'active' : 'inactive'}`}
                            onClick={() => setActiveTab('name')}
                        >
                            Por nombre
                        </span>
                        <span
                            className={`tab ${activeTab === 'band' ? 'active' : 'inactive'}`}
                            onClick={() => setActiveTab('band')}
                        >
                            Por banda
                        </span>
                    </div>

                    {activeTab === 'name' ? (
                        <div className="checkbox-group">
                            <label className="checkbox-label">
                                <input type="checkbox" /> STARLINK-1121
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" /> STARLINK-1114
                            </label>
                            <label className="checkbox-label">
                                <input type="checkbox" /> STARLINK-1067
                            </label>
                        </div>
                    ) : (
                        <div className="checkbox-group">
                            <span style={{ color: '#707080', fontSize: '0.8rem' }}>
                                Opciones de bandas próximamente...
                            </span>
                        </div>
                    )}
                </div>

                <div className="filter-section">
                    <div className="filter-title">Filtrar estaciones</div>
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input type="checkbox" /> SCORPIO-S01
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" /> SCORPIO-S02
                        </label>
                    </div>
                </div>

            </div>
        </div>
    );
};
