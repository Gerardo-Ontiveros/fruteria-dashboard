import {Routes, Route} from "react-router"
import Dashboard from "../pages/Dashboard"
import SideBar from "../components/SiderBar"
import Products from "../pages/Products"
import Expiry from "../pages/Expiry"
import StockEntryPage from "../pages/StockEntry"
import StockExitPage from "../pages/StockExit"

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<SideBar/>}>
            <Route index element={<Dashboard/>}/>
            <Route path="productos" element={<Products/>}/>
            <Route path="caducidad" element={<Expiry/>}/>
            <Route path="entradas" element={<StockEntryPage/>}/>
            <Route path="salidas" element={<StockExitPage/>}/>
            </Route>
        </Routes>
    )
}