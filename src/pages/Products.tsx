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
  Space,
  Tag,
  Alert,
  Layout,
  Typography,
  Spin,
  Card
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Products as ProductsAPI } from '../services/api';
import type { Product } from '../types/Product';
import { getExpiryStatus, formatDate, formatCurrency } from '../utils/helpers';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Error al cargar los productos');
      message.error('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }; 

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      form.setFieldsValue({ ...product, expiryDate: dayjs(product.expiryDate) });
    } else {
      setEditingProduct(null);
      form.resetFields();
    }
    setModalVisible(true);
  }; 

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingProduct(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const productData = {
        ...values,
        expiryDate: values.expiryDate.format('YYYY-MM-DD'),
      };

      if (editingProduct) {
        await ProductsAPI.update(editingProduct.id, productData);
        message.success('Producto actualizado');
      } else {
        await ProductsAPI.create(productData);
        message.success('Producto creado');
      }
      handleCloseModal();
      loadProducts();
    } catch (err) {
      message.error('Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await ProductsAPI.delete(id);
      message.success('Producto eliminado');
      loadProducts();
    } catch (err) {
      message.error('Error al eliminar');
    }
  };

  const getTagColor = (status: string) => {
    const colors: Record<string, string> = { valid: 'success', expiringSoon: 'warning', expired: 'error' };
    return colors[status] || 'default';
  }; 

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: (a, b) => a.id - b.id },
    { title: 'Nombre', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'Categoría', dataIndex: 'category', key: 'category', render: (cat) => <Tag bordered={false}>{cat}</Tag> },
    { title: 'Precio', dataIndex: 'price', key: 'price', render: (p) => formatCurrency(p) },
    { title: 'Stock', dataIndex: 'stock', key: 'stock', render: (s, record) => <Text>{s} {record.unit}</Text> },
    { title: 'Fecha Caducidad', dataIndex: 'expiryDate', key: 'expiryDate', render: (f) => formatDate(f) },
    {
      title: 'Estado',
      key: 'estado',
      render: (_, record) => {
        const status = getExpiryStatus(record.expiryDate);
        const labels: Record<string, string> = { valid: 'Vigente', expiringSoon: 'Por caducar', expired: 'Caducado' };
        return <Tag color={getTagColor(status)} bordered={false}>{labels[status]}</Tag>; 
      },
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button type="text" aria-label={`Editar ${record.name}`} icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          <Popconfirm title="¿Eliminar producto?" onConfirm={() => handleDelete(record.id)} okText="Sí" cancelText="No">
            <Button type="text" danger aria-label={`Eliminar ${record.name}`} icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading) return <div style={{ display: 'grid', placeItems: 'center', height: '80vh' }}><Spin size="large" /></div>;

  return (
    <Content style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto'}}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header con diseño Dashboard */}
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <Title level={2} style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>Gestión de Inventario</Title>
              <Text type="secondary">Administra y controla el stock de tus productos</Text>
            </div>
            <Button
              size="large"
              icon={<PlusOutlined />}
              aria-label="Nuevo Producto"
              onClick={() => handleOpenModal()}
              style={{ borderRadius: '12px', fontWeight: 600, height: '48px', padding: '0 24px', backgroundColor: '#747474', color: '#fff' }}
            >
              Nuevo Producto
            </Button>
          </div>

          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 24, borderRadius: '12px' }} />}

          {/* Tabla dentro de una Card estilizada */}
            <Card bordered={false} role="region" aria-label="Tabla de Productos" style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Table
              columns={columns}
              dataSource={products}
              rowKey="id"
              pagination={{ pageSize: 8, showSizeChanger: true }}
              scroll={{ x: 1000 }}
              className="custom-table"
              aria-label="Tabla de Productos"
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>{editingProduct ? 'Editar Producto' : 'Añadir Producto'}</Title>}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText="Guardar Cambios"
        cancelText="Cancelar"
        okButtonProps={{ 'aria-label': 'Guardar Cambios' }}
        cancelButtonProps={{ 'aria-label': 'Cancelar' }}
        wrapProps={{ role: 'dialog', 'aria-label': editingProduct ? 'Editar Producto' : 'Añadir Producto' }}
        width={600}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item name="name" label="Nombre" rules={[{ required: true }]}>
            <Input placeholder="Nombre del producto" aria-label="Nombre del producto" />
          </Form.Item>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="category" label="Categoría" rules={[{ required: true }]}>
              <Select placeholder="Seleccionar" aria-label="Seleccionar categoría">
                <Option value="Frutas">Frutas</Option>
                <Option value="Verduras">Verduras</Option>
              </Select>
            </Form.Item>
            <Form.Item name="unit" label="Unidad" rules={[{ required: true }]}>
              <Select aria-label="Seleccionar unidad">
                <Option value="kg">Kilogramos (kg)</Option>
                <Option value="pieza">Pieza</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item name="price" label="Precio (MXN)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
            <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
          </div>

          <Form.Item name="supplier" label="Proveedor" rules={[{ required: true }]}>
            <Input placeholder="Nombre del proveedor" />
          </Form.Item>

          <Form.Item name="expiryDate" label="Fecha de Caducidad" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={(current) => current && current < dayjs().startOf('day')} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .custom-table .ant-table-thead > tr > th {
          background-color: transparent !important;
          border-bottom: 1px solid #f0f0f0 !important;
          font-weight: 600;
          color: #8c8c8c;
        }
        .ant-table-row:hover {
          background-color: #fafafa;
        }
        .ant-btn-text:hover {
          background-color: #f0f0f0 !important;
        }
      `}</style>
    </Content>
  );
};

export default Products;