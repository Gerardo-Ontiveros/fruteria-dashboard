import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Alert,
  Tag,
  Layout,
  Typography,
  Card,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,

} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { StockExits, Products } from '../services/api';
import type { StockExit } from '../types/Movement';
import type { Product } from '../types/Product';
import { formatDate } from '../utils/helpers';

const { Content } = Layout;
const { Title, Text } = Typography;

const StockExitPage: React.FC = () => {
  const [exits, setExits] = useState<StockExit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [exitsRes, productsRes] = await Promise.all([
        StockExits.getAll(),
        Products.getAll(),
      ]);
      setExits(exitsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }; 

  const handleOpenModal = () => {
    form.resetFields();
    form.setFieldsValue({ date: dayjs(), reason: 'Venta' });
    setSelectedProduct(null);
    setModalVisible(true);
  }; 

  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
    setSelectedProduct(null);
  };

  const handleProductChange = (id: number) => {
    const p = products.find((item) => item.id === id);
    setSelectedProduct(p || null);
  }; 

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.id === values.productId);
      
      if (!product) return;
      if (product.stock < values.quantity) {
        message.error('Stock insuficiente para realizar la salida');
        return;
      }

      const exitData = {
        productId: values.productId,
        productName: product.name,
        quantity: values.quantity,
        date: values.date.format('YYYY-MM-DD'),
        reason: values.reason,
        customer: values.customer,
      };

      await StockExits.create(exitData);
      await Products.update(product.id, { stock: product.stock - values.quantity });

      message.success('Salida registrada con éxito');
      handleCloseModal();
      loadData();
    } catch (err) {
      message.error('Error al registrar la salida');
    }
  };

  const handleDelete = async (exit: StockExit) => {
    try {
      const product = products.find((p) => p.id === exit.productId);
      if (!product) return;

      await StockExits.delete(exit.id);
      await Products.update(product.id, { stock: product.stock + (exit.quantity ?? 0) });
      
      message.success('Salida eliminada y stock revertido');
      loadData();
    } catch (err) {
      message.error('Error al eliminar');
    }
  }; 

  const columns: ColumnsType<StockExit> = [
    { 
      title: 'Producto', 
      dataIndex: 'productName', 
      key: 'productName',
      render: (text) => <Text strong>{text}</Text> 
    },
    { 
      title: 'Cantidad', 
      dataIndex: 'quantity', 
      render: (q) => <Tag color="volcano" bordered={false}>-{q} unidades</Tag> 
    },
    { title: 'Fecha', dataIndex: 'date', render: (d) => formatDate(d) },
    { 
      title: 'Motivo', 
      dataIndex: 'reason',
      render: (motivo) => {
        const colors: Record<string, string> = {
          Venta: 'cyan', Merma: 'red', 'Uso Interno': 'blue', Donación: 'purple'
        };
        return <Tag color={colors[motivo]} bordered={false}>{motivo}</Tag>;
      }
    },
    { title: 'Cliente/Destino', dataIndex: 'customer', key: 'customer' },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="¿Revertir esta salida?"
          onConfirm={() => handleDelete(record)}
          okText="Sí"
          cancelText="No"
        >
          <Button type="text" danger aria-label={`Eliminar salida ${record.productName}`} icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}><Spin size="large" /></div>;

  return (
    <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Title level={2} style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>Salidas de Inventario</Title>
              </div>
              <Text type="secondary">Control de egresos, ventas y mermas de productos</Text>
            </div>
            <Button
              type="primary"
              danger
              size="large"
              icon={<PlusOutlined />}
              aria-label="Nueva Salida"
              onClick={handleOpenModal}
              style={{ borderRadius: '12px', fontWeight: 600, height: '48px', padding: '0 24px', backgroundColor: '#747474', color: '#fff' }}

            >
              Nueva Salida
            </Button>
          </div>

          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 24, borderRadius: '12px' }} />}

          <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Table
              columns={columns}
              dataSource={exits}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 1000 }}
              aria-label="Tabla de Salidas"
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Registrar Nueva Salida</Title>}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText="Confirmar Salida"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
        width={550}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="productId"
            label="Producto a retirar"
            rules={[{ required: true, message: 'Seleccione un producto' }]}
          >
            <Select
              placeholder="Buscar producto..."
              aria-label="Seleccionar producto"
              showSearch
              optionFilterProp="label"
              onChange={(value) => handleProductChange(value as number)}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (Stock: ${p.stock} ${p.unit})`,
              }))}
            />
          </Form.Item>

            {selectedProduct && (
            <div style={{ marginBottom: 24, padding: '12px', background: '#fff2e8', borderRadius: '8px', border: '1px solid #ffbb96' }}>
              <Text strong style={{ color: '#d4380d' }}>
                Stock disponible: {selectedProduct.stock} {selectedProduct.unit}
              </Text>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="quantity"
              label="Cantidad de Salida"
              rules={[{ required: true }, { type: 'number', min: 1 }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                placeholder="0" 
                max={selectedProduct?.stock}
                aria-label="Cantidad de Salida"
              />
            </Form.Item>

            <Form.Item
              name="reason"
              label="Motivo"
              rules={[{ required: true }]}
            >
              <Select options={[
                { value: 'Venta', label: 'Venta' },
                { value: 'Merma', label: 'Merma' },
                { value: 'Uso Interno', label: 'Uso Interno' },
                { value: 'Donación', label: 'Donación' },
              ]} aria-label="Seleccionar motivo" />
            </Form.Item>

          <Form.Item
            name="customer"
            label="Cliente o Destino"
            rules={[{ required: true }, { min: 3 }]}
          >
            <Input placeholder="Ej: Supermercado Central / Sucursal Norte" aria-label="Cliente o Destino" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Fecha de Operación"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" aria-label="Fecha de Operación" />
          </Form.Item>
        </div>
        </Form>
      </Modal>

      <style>{`
        .ant-table-thead > tr > th {
          background-color: transparent !important;
          border-bottom: 1px solid #f0f0f0 !important;
          font-weight: 600;
          color: #8c8c8c;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        .ant-btn-primary { box-shadow: 0 4px 6px rgba(255, 77, 79, 0.2); }
      `}</style>
    </Content>
  );
};

export default StockExitPage;