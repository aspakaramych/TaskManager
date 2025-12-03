import './App.css'
import {BrowserRouter, Route, Routes} from "react-router";
import LoginPage from "./Pages/LoginPage.tsx";
import RegistryPage from "./Pages/RegistryPage.tsx";
import MainPage from "./Pages/MainPage.tsx";
import PrivateRoute from "./Components/PrivateRoute.tsx";

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistryPage />} />
            <Route path="/" element={
                <PrivateRoute>
                    <MainPage />
                </PrivateRoute>
            } />
        </Routes>
    </BrowserRouter>
  )
}

export default App
