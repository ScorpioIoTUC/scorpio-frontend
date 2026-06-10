import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";


function Routing() {
    return (
        <>
        <BrowserRouter>
            <Routes>
                <Route path={'/'} element={<App/>}/>
            </Routes>
        </BrowserRouter>
        </>
    )
}

export default Routing;