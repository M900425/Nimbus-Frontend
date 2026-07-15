import "./Header.scss";
import { Layout, Menu, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

const { Header: AntHeader } = Layout;

const menuItems: MenuProps["items"] = [{ key: "1", label: "Weather" }];

export const Header = () => {
  return (
    <AntHeader className="app-header">
      <div className="logo">Nimbus</div>
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={["1"]}
        items={menuItems}
        className="header-menu"
      />
      <Avatar icon={<UserOutlined />} className="user-avatar" />
    </AntHeader>
  );
};
