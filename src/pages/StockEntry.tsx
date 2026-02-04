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
  Layout,
  Typography,
  Card,
  Spin,
  Tag
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { StockEntries, Products } from '../services/api';
import type { StockEntry as StockEntryType } from '../types/Movement';
import type { Product } from '../types/Product';
import { formatDate, formatCurrency } from '../utils/helpers';

const { Content } = Layout;
const { Title, Text } = Typography;

const StockEntryPage: React.FC = () => {
  const [entries, setEntries] = useState<StockEntryType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [entriesRes, productsRes] = await Promise.all([
        StockEntries.getAll(),
        Products.getAll(),
      ]);
      setEntries(entriesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Error al cargar los datos');
      message.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }; 

  const handleOpenModal = () => {
    form.resetFields();
    form.setFieldsValue({ date: dayjs() });
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const product = products.find((p) => p.id === values.productId);
      
      if (!product) {
        message.error('Producto no encontrado');
        return;
      }

      const entryData = {
        productId: values.productId,
        productName: product.name,
        quantity: values.quantity,
        date: values.date.format('YYYY-MM-DD'),
        supplier: values.supplier,
        purchasePrice: values.purchasePrice,
      };

      await StockEntries.create(entryData);
      const newStock = product.stock + values.quantity;
      await Products.update(product.id, { stock: newStock });

      message.success('Entrada registrada correctamente');
      handleCloseModal();
      loadData();
    } catch (err) {
      message.error('Error al registrar la entrada');
    }
  };

  const handleDelete = async (entry: StockEntryType) => {
    try {
      const product = products.find((p) => p.id === entry.productId);
      if (!product) return;

      if (product.stock < (entry.quantity ?? 0)) {
        message.error('No se puede revertir: Stock insuficiente');
        return;
      }

      await StockEntries.delete(entry.id);
      const newStock = product.stock - (entry.quantity ?? 0);
      await Products.update(product.id, { stock: newStock });

      message.success('Entrada eliminada y stock revertido');
      loadData();
    } catch (err) {
      message.error('Error al eliminar');
    }
  }; 

  const columns: ColumnsType<StockEntryType> = [
    { 
      title: 'Producto', 
      dataIndex: 'productName', 
      key: 'productName',
      render: (text) => <Text strong>{text}</Text> 
    },
    { 
      title: 'Cantidad', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      render: (q) => <Tag color="green" bordered={false}>+{q} unidades</Tag> 
    },
    { title: 'Fecha', dataIndex: 'date', key: 'date', render: (d) => formatDate(d) },
    { title: 'Proveedor', dataIndex: 'supplier', key: 'supplier', render: (s) => <Tag bordered={false}>{s}</Tag> },
    { 
      title: 'Costo Unit.', 
      dataIndex: 'purchasePrice', 
      render: (p) => formatCurrency(p) 
    },
    { 
      title: 'Total', 
      key: 'total', 
      render: (_, record) => <Text strong>{formatCurrency((record.quantity ?? 0) * (record.purchasePrice ?? 0))}</Text>
    },
    {
      title: 'Acciones',
      key: 'acciones',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="¿Eliminar esta entrada?"
          description="Se descontará la cantidad del stock actual."
          onConfirm={() => handleDelete(record)}
          okText="Sí"
          cancelText="No"
        >
          <Button type="text" danger aria-label={`Eliminar entrada ${record.productName}`} icon={<DeleteOutlined />} />
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
                <Title level={2} style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>Entradas de Stock</Title>
              </div>
              <Text type="secondary">Registra y monitorea el ingreso de mercancía al almacén</Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              aria-label="Nueva Entrada"
              onClick={handleOpenModal}
              style={{ borderRadius: '12px', fontWeight: 600, height: '48px', padding: '0 24px', backgroundColor: '#747474', color: '#fff' }}

            >
              Nueva Entrada
            </Button>
          </div>

          {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 24, borderRadius: '12px' }} />}

          <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Table
              columns={columns}
              dataSource={entries}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              scroll={{ x: 1000 }}
              aria-label="Tabla de Entradas"
            />
          </Card>
        </motion.div>
      </AnimatePresence>

      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Registrar Entrada de Mercancía</Title>}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        okText="Registrar Entrada"
        cancelText="Cancelar"
        width={550}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            name="productId"
            label="Producto"
            rules={[{ required: true, message: 'Seleccione un producto' }]}
          >
            <Select
              placeholder="Buscar producto..."
              aria-label="Seleccionar producto"
              showSearch
              optionFilterProp="label"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (Stock: ${p.stock} ${p.unit})`,
              }))}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="quantity"
              label="Cantidad de Ingreso"
              rules={[{ required: true }, { type: 'number', min: 1 }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="0" aria-label="Cantidad de Ingreso" />
            </Form.Item>

            <Form.Item
              name="purchasePrice"
              label="Costo Unitario (MXN)"
              rules={[{ required: true }, { type: 'number', min: 0.01 }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder="0.00" precision={2} aria-label="Costo unitario" />
            </Form.Item>
          </div>

          <Form.Item
            name="supplier"
            label="Proveedor"
            rules={[{ required: true }, { min: 3 }]}
          >
            <Input placeholder="Ej: Frutas del Valle" aria-label="Proveedor" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Fecha de Operación"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" aria-label="Fecha de Operación" />
          </Form.Item>


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
        .ant-btn-primary {
          box-shadow: 0 4px 6px rgba(82, 196, 26, 0.2);
        }
      `}</style>
    </Content>
  );
};

export default StockEntryPage;