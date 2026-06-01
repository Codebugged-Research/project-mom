import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Copilot from "./pages/Copilot";
import Recommendations from "./pages/Recommendations";
import Simulator from "./pages/Simulator";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/copilot" element={<Copilot />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
