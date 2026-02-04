import { useEffect, useState } from 'react';
import { Table, Tag, Tabs, Card, Row, Col, Layout, Typography, Spin, Space, Alert } from 'antd';

import type { ColumnsType } from 'antd/es/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Products } from '../services/api';
import type { Product } from '../types/Product';
import { getExpiryStatus, getDaysRemaining, formatCurrency, formatDate } from '../utils/helpers';

const { Content } = Layout;
const { Title, Text } = Typography;

const Expiry: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await Products.getAll();
      setProducts(response.data || []);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }; 

  const productsValid = products.filter(p => getExpiryStatus(p.expiryDate) === 'valid');
  const productsExpiringSoon = products.filter(p => getExpiryStatus(p.expiryDate) === 'expiringSoon');
  const productsExpired = products.filter(p => getExpiryStatus(p.expiryDate) === 'expired');

  const columns: ColumnsType<Product> = [
    { title: 'Producto', dataIndex: 'name', key: 'name', render: (t) => <Text strong>{t}</Text> },
    { title: 'Stock', dataIndex: 'stock', key: 'stock', render: (s, r) => `${s} ${r.unit}` },
    { title: 'Precio', dataIndex: 'price', key: 'price', render: (p) => formatCurrency(p) },
    { title: 'Fecha Caducidad', dataIndex: 'expiryDate', key: 'expiryDate', render: (d) => formatDate(d) },
    {
      title: 'Estado',
      key: 'diasRestantes',
      render: (_, record) => {
        const dias = getDaysRemaining(record.expiryDate);
        const status = getExpiryStatus(record.expiryDate);
        const config = {
          expired: { color: 'error', text: `Expiró hace ${Math.abs(dias)}d` },
          expiringSoon: { color: 'warning', text: `Vence en ${dias}d` },
          valid: { color: 'success', text: `${dias} días restantes` },
        };
        const current = config[status as keyof typeof config];
        return <Tag color={current.color} bordered={false} style={{ borderRadius: '4px' }}>{current.text}</Tag>; 
      },
    },
  ];

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}><Spin size="large" /></div>;

  const total = products.length || 1; 

  return (
    <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          
          <div style={{ marginBottom: '40px' }}>
            <Title level={2} style={{ fontSize: '32px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Control de Caducidad</Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>Estado preventivo de la mercancía</Text>
          </div>

          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 24, borderRadius: '12px' }} />}

          {/* Widgets Estilo "Glance" */}
          <Row gutter={[24, 24]} style={{ marginBottom: '40px' }}>
            {[
              { label: 'Mercancía Vigente', count: productsValid.length, color: '#52c41a', tag: 'Seguro' },
              { label: 'Próximos a Vencer', count: productsExpiringSoon.length, color: '#faad14', tag: 'Atención' },
              { label: 'Productos Caducados', count: productsExpired.length, color: '#ff4d4f', tag: 'Crítico' },
            ].map((item, i) => (
              <Col xs={24} md={8} key={i}>
                <Card bordered={false} className="glance-card">
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Tag color={i === 0 ? 'green' : i === 1 ? 'orange' : 'red'} bordered={false} style={{ borderRadius: '6px', marginBottom: '12px', fontWeight: 600 }}>
                      {item.tag}
                    </Tag>
                    <div>
                      <Text style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1 }}>{item.count}</Text>
                      <Text type="secondary" style={{ marginLeft: '10px', fontSize: '14px' }}>{item.label}</Text>
                    </div>
                    {/* Barra de progreso minimalista */}
                    <div style={{ width: '100%', height: '6px', background: '#f0f0f0', borderRadius: '10px', marginTop: '20px', overflow: 'hidden' }}>
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${(item.count / total) * 100}%` }} 
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{ height: '100%', background: item.color, borderRadius: '10px' }} 
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            ))} 
          </Row>

          <Card bordered={false} style={{ borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
            <Tabs
              defaultActiveKey="1"
              tabBarStyle={{ marginBottom: '24px', paddingLeft: '10px' }}
              aria-label="Pestañas de Caducidad"
              items={[
                { key: '1', label: `Vigentes`, children: <Table columns={columns} dataSource={productsValid} rowKey="id" pagination={{ pageSize: 8 }} size="middle" aria-label="Tabla Vigentes" /> },
                { key: '2', label: `Por Caducar`, children: <Table columns={columns} dataSource={productsExpiringSoon} rowKey="id" pagination={{ pageSize: 8 }} size="middle" aria-label="Tabla Próximos a Vencer" /> },
                { key: '3', label: `Caducados`, children: <Table columns={columns} dataSource={productsExpired} rowKey="id" pagination={{ pageSize: 8 }} size="middle" aria-label="Tabla Caducados" /> },
              ]}
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      <style>{`
        .glance-card {
          border-radius: 20px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .glance-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.06) !important;
        }
        .ant-table-thead > tr > th { 
          background: transparent !important; 
          border-bottom: 1px solid #f5f5f5 !important; 
          font-weight: 600; 
          color: #bfbfbf;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .ant-tabs-ink-bar { height: 3px !important; border-radius: 3px; }
        .ant-tabs-tab { padding: 12px 16px !important; margin-left: 0 !important; }
        .ant-tabs-tab-btn { font-size: 15px; font-weight: 500; }
      `}</style>
    </Content>
  );
};

export default Expiry;