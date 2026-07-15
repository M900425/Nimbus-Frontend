import "./App.scss";
import { Layout } from "antd";
import { Header } from "./components/header/Header";

const { Content } = Layout;

function App() {
  return (
    <Layout className="app-layout">
      <Header />
      <Content className="app-content">
        {/* Тут буде контент сторінок */}
      </Content>
    </Layout>
  );
}

export default App;
