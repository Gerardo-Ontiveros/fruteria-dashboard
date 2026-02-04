import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Spin, Typography, Tag, Layout } from 'antd';
import {
  ShoppingCartOutlined,
  WarningOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Products, StockEntries, StockExits } from '../services/api';
import type { StockEntry, StockExit } from '../types/Movement';
import { getExpiryStatus, formatDate } from '../utils/helpers';
import { motion, AnimatePresence } from 'framer-motion'; 

const { Content } = Layout;
const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [totalStock, setTotalStock] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const [recentEntries, setRecentEntries] = useState<StockEntry[]>([]);
  const [recentExits, setRecentExits] = useState<StockExit[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, entriesRes, exitsRes] = await Promise.all([
        Products.getAll(),
        StockEntries.getAll(),
        StockExits.getAll(),
      ]);
      const products = productsRes.data || [];
      setTotalStock(products.reduce((acc: number, p: any) => acc + (p.stock || 0), 0));
      setExpiringSoonCount(products.filter((p: any) => getExpiryStatus(p.expiryDate) === 'expiringSoon').length);
      setRecentEntries(entriesRes.data?.slice(-5).reverse() || []);
      setRecentExits(exitsRes.data?.slice(-5).reverse() || []);
    } finally {
      setLoading(false);
    }
  };

  const widgetStyle = {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    border: 'none',
    height: '100%',
  };

  const iconContainer = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    marginBottom: '16px',
    fontSize: '20px'
  };

  const columns = (type: 'entry' | 'exit'): ColumnsType<any> => [
    { title: 'Producto', dataIndex: 'productName', key: 'name' },
    { 
      title: 'Cantidad', 
      dataIndex: 'quantity', 
      render: (q) => <Text strong style={{ color: type === 'entry' ? '#52c41a' : '#ff4d4f' }}>{type === 'entry' ? '+' : '-'}{q}</Text> 
    },
    { title: 'Fecha', dataIndex: 'date', render: (f) => formatDate(f) },
    { 
      title: type === 'entry' ? 'Proveedor' : 'Cliente', 
      dataIndex: type === 'entry' ? 'supplier' : 'customer',
      render: (val) => <Tag bordered={false}>{val}</Tag>
    },
  ];

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}><Spin size="large" /></div>;

  return (
    <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>Vista rapida</Title>
              <Text type="secondary">Da una vista rapida a tu inventario</Text>

      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} md={8}>
          <Card style={widgetStyle}>
            <div style={iconContainer}><ShoppingCartOutlined /></div>
            <Statistic title={<Text type="secondary">Stock Total</Text>} value={totalStock} valueStyle={{ fontWeight: 700 }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>Unidades disponibles en Productos</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={widgetStyle}>
            <div style={iconContainer}><WarningOutlined /></div>
            <Statistic title={<Text type="secondary">Expiran Pronto</Text>} value={expiringSoonCount} valueStyle={{ fontWeight: 700, color: '#faad14' }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>Productos que expiran en los próximos 7 días</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={widgetStyle}>
            <div style={iconContainer}><ArrowUpOutlined /></div>
            <Statistic title={<Text type="secondary">Movimientos recientes</Text>} value={recentEntries.length + recentExits.length} valueStyle={{ fontWeight: 700 }} />
            <Text type="secondary" style={{ fontSize: '12px' }}>Movimientos registrados en los últimos 30 días</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div style={{ marginBottom: '24px' }}>
             <Text strong style={{ fontSize: '18px' }}>Historial de Movimientos</Text>
             <div style={{ color: '#8c8c8c', fontSize: '12px' }}>Últimos movimientos de stock</div>
          </div>
          
          <Row gutter={[24, 24]}>
            <Col xs={24} xl={12}>
              <Card title="Últimos Ingresos" bordered={false} style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Table 
                  dataSource={recentEntries} 
                  columns={columns('entry')} 
                  pagination={false} 
                  size="middle" 
                  rowKey="id"
                  aria-label="Tabla Últimos Ingresos"
                />
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card title="Últimos Egresos" bordered={false} style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <Table 
                  dataSource={recentExits} 
                  columns={columns('exit')} 
                  pagination={false} 
                  size="middle" 
                  rowKey="id"
                  aria-label="Tabla Últimos Egresos"
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <style>{`
        .ant-table-thead > tr > th {
          background-color: transparent !important;
          border-bottom: 1px solid #f0f0f0 !important;
          font-weight: 600;
        }
        .ant-card-head {
          border-bottom: none !important;
          padding: 24px 24px 0 24px;
        }
        .ant-card-head-title {
          font-size: 18px;
          font-weight: 700;
        }
      `}</style>
      </motion.div>
      </AnimatePresence>
    </Content>
  );
};

export default Dashboard;