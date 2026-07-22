import "./App.scss";
import { Layout } from "antd";
import { Routes, Route } from "react-router-dom";
import { Header } from "./components/header/Header";
import { HomePage } from "./pages/HomePage/HomePage";
import { WeatherPage } from "./pages/WeatherPage/WeatherPage";
import { GeocodePage } from "./pages/GeocodePage/GeocodePage";

const { Content } = Layout;

function App() {
  return (
    <Layout className="app-layout">
      <Header />
      <Content className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/weather/:city" element={<WeatherPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/geocode" element={<GeocodePage />} />
        </Routes>
      </Content>
    </Layout>
  );
}

export default App;
