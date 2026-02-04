import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { Layout, Menu, Typography, Space, Button,  type MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreFilled,
  ProductFilled,
  AlertFilled,
  LoginOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import LOGO from "../assets/fruteria.png";

const { Sider, Content } = Layout;
const { Title } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group'
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const SideBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const items: MenuItem[] = [
    getItem('DASHBOARD', 'grp-dashboards', null, [
      getItem('Dashboard', '/', <AppstoreFilled style={{ fontSize: "20px" }} />),
    ], 'group'),

    getItem('PRODUCTOS', 'grp-apps', null, [
      getItem('Productos', '/productos', <ProductFilled style={{ fontSize: "20px" }} />),
      getItem('Caducidad', '/caducidad', <AlertFilled style={{ fontSize: "20px" }} />),
    ], 'group'),

    getItem('MOVIMIENTOS', 'grp-pages', null, [
      getItem('Entradas', '/entradas', <LoginOutlined style={{ fontSize: "20px" }} />),
      getItem('Salidas', '/salidas', <LogoutOutlined style={{ fontSize: "20px" }} />),
    ], 'group'),
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={280}
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        breakpoint="lg"
        collapsedWidth="80"
        trigger={null}
        role="navigation"
        aria-label="Menú principal"
        style={{
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        <div style={{ 
          padding: '16px', 
          display: 'flex', 
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between',
          gap: collapsed ? '12px' : '0'
        }}>
          {collapsed && (
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setCollapsed(false)}
              aria-label="Expandir menú"
              style={{ fontSize: '18px' }}
            />
          )}
          
          <Space align="center" size={8}>
            <img src={LOGO} width={32} alt="Logo Frutería" />
            {!collapsed && <Title level={4} style={{ margin: 0 }}>FRUTERIA</Title>}
          </Space>

          {!collapsed && (
            <Button
              type="text"
              icon={<MenuFoldOutlined />}
              onClick={() => setCollapsed(true)}
              aria-label="Colapsar menú"
              style={{ fontSize: '18px' }}
            />
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Menu
            mode="inline"
            aria-label="Menú de navegación"
            selectedKeys={[location.pathname]}
            items={items}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
            className="custom-sidebar-menu"
          />
        </div>
      </Sider>

      <Layout style={{ 
        marginLeft: collapsed ? 80 : 280, 
        transition: 'all 0.2s',
        minHeight: '100vh' 
      }}>
        <Content style={{ padding: 24, background: '#f0f2f5' }}>
          <Outlet /> 
        </Content>
      </Layout>

      <style>{`
        .custom-sidebar-menu .ant-menu-item {
          font-size: 16px !important;
          font-weight: 600;
          color: #636e7e;
        }
        .ant-menu-item-group-title {
          font-size: 11px;
          font-weight: bold;
          letter-spacing: 1px;
          color: #999 !important;
          text-transform: uppercase;
        }
        .ant-menu-item-selected {
          background-color: #f5f5f5 !important;
          color: #1d1f22 !important;
        }
      `}</style>
    </Layout>
  );
};

export default SideBar;