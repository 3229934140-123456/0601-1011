import React, { useState, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Select,
  Table,
  Tag,
  Modal,
  Form,
  InputNumber,
  Radio,
  message,
  Space,
  Divider
} from 'antd';
import {
  SearchOutlined,
  ScanOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { Product, PriceCheckRecord } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const PriceCheck: React.FC = () => {
  const { products, tasks, priceRecords, addPriceRecord, currentTask, stores, user } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [selectedTask, setSelectedTask] = useState(currentTask?.id || '');
  const [scanModal, setScanModal] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();
  const scanInputRef = useRef<any>(null);

  const taskList = tasks.filter(
    (t) => t.status === 'in_progress' && t.inspector === user.name
  );

  const currentTaskData = tasks.find((t) => t.id === selectedTask);
  const currentStore = stores.find((s) => s.id === currentTaskData?.storeId);

  const taskRecords = priceRecords.filter((r) => r.taskId === selectedTask);

  const handleSearch = () => {
    const product = products.find(
      (p) => p.barcode === searchText || p.name.includes(searchText)
    );
    if (product) {
      setScannedProduct(product);
      setScanModal(true);
      form.resetFields();
      form.setFieldsValue({
        actualPrice: product.standardPrice,
        isCorrect: true
      });
    } else {
      message.warning('未找到该商品');
    }
  };

  const handleScan = () => {
    const barcode = searchText.trim();
    if (!barcode) {
      message.warning('请输入或扫描商品条码');
      return;
    }
    if (!selectedTask) {
      message.warning('请先选择巡检任务');
      return;
    }
    handleSearch();
  };

  const handleAddRecord = () => {
    form.validateFields().then((values) => {
      if (!scannedProduct || !selectedTask || !currentTaskData) return;

      const newRecord: PriceCheckRecord = {
        id: `pr${Date.now()}`,
        taskId: selectedTask,
        storeId: currentTaskData.storeId,
        productId: scannedProduct.id,
        productName: scannedProduct.name,
        barcode: scannedProduct.barcode,
        standardPrice: scannedProduct.standardPrice,
        actualPrice: values.actualPrice,
        isCorrect: values.isCorrect,
        problemType: values.isCorrect ? undefined : values.problemType,
        remark: values.remark,
        checkTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };

      addPriceRecord(newRecord);
      message.success('价格核验记录已保存');
      setScanModal(false);
      setSearchText('');
      setScannedProduct(null);

      setTimeout(() => {
        scanInputRef.current?.focus();
      }, 100);
    });
  };

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
      width: 200
    },
    {
      title: '条码',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 160
    },
    {
      title: '标准价',
      dataIndex: 'standardPrice',
      key: 'standardPrice',
      width: 100,
      render: (price: number) => <span>¥{price.toFixed(2)}</span>
    },
    {
      title: '实际价',
      dataIndex: 'actualPrice',
      key: 'actualPrice',
      width: 100,
      render: (price: number) => <span>¥{price.toFixed(2)}</span>
    },
    {
      title: '核验结果',
      dataIndex: 'isCorrect',
      key: 'isCorrect',
      width: 100,
      render: (isCorrect: boolean) =>
        isCorrect ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            正确
          </Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            异常
          </Tag>
        )
    },
    {
      title: '问题类型',
      dataIndex: 'problemType',
      key: 'problemType',
      width: 120,
      render: (type?: string) => {
        if (!type) return '-';
        const map: Record<string, string> = {
          wrong_price: '价格错误',
          out_of_stock: '缺货',
          no_price_tag: '无价格标签'
        };
        return <Tag color="orange">{map[type] || type}</Tag>;
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text?: string) => text || '-'
    },
    {
      title: '核验时间',
      dataIndex: 'checkTime',
      key: 'checkTime',
      width: 170
    }
  ];

  const correctCount = taskRecords.filter((r) => r.isCorrect).length;
  const errorCount = taskRecords.filter((r) => !r.isCorrect).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">商品核价</h2>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#1677ff' }}>
              {taskRecords.length}
            </div>
            <div className="stat-label">已核验商品</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#52c41a' }}>
              {correctCount}
            </div>
            <div className="stat-label">价格正确</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#ff4d4f' }}>
              {errorCount}
            </div>
            <div className="stat-label">价格异常</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#faad14' }}>
              {taskRecords.length > 0 ? ((correctCount / taskRecords.length) * 100).toFixed(1) : 0}%
            </div>
            <div className="stat-label">正确率</div>
          </div>
        </Col>
      </Row>

      <Card className="card-section">
        <div className="filter-bar">
          <span style={{ color: '#666' }}>当前任务：</span>
          <Select
            placeholder="请选择巡检任务"
            value={selectedTask || undefined}
            onChange={(val) => setSelectedTask(val)}
            style={{ width: 300 }}
          >
            {taskList.map((task) => (
              <Option key={task.id} value={task.id}>
                {task.title} - {task.storeName}
              </Option>
            ))}
          </Select>
          {currentStore && (
            <Tag color="blue">{currentStore.name}</Tag>
          )}
          <div style={{ flex: 1 }} />
        </div>

        <Divider />

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <Input
            ref={scanInputRef}
            size="large"
            prefix={<ScanOutlined />}
            placeholder="扫描或输入商品条码"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleScan}
            style={{ flex: 1, maxWidth: 400 }}
            autoFocus
          />
          <Button type="primary" size="large" icon={<ScanOutlined />} onClick={handleScan}>
            扫码核验
          </Button>
          <Button size="large" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索商品
          </Button>
          <Button size="large" icon={<PlusOutlined />} onClick={() => { setScannedProduct(null); setScanModal(true); form.resetFields(); }}>
            手动录入
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: '#999', fontSize: 12 }}>
            提示：使用条码枪扫描商品条码自动核验，或输入条码/商品名称搜索
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={taskRecords}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={scannedProduct ? '商品价格核验' : '手动录入价格'}
        open={scanModal}
        onOk={handleAddRecord}
        onCancel={() => setScanModal(false)}
        okText="保存记录"
        cancelText="取消"
        width={600}
      >
        {scannedProduct && (
          <Card size="small" style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Row gutter={16}>
              <Col span={16}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                  {scannedProduct.name}
                </div>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                  条码: {scannedProduct.barcode} | 规格: {scannedProduct.spec}
                </div>
                <div>
                  <span className="price-tag">¥{scannedProduct.standardPrice}</span>
                  {scannedProduct.promotionPrice && (
                    <>
                      <span className="price-tag original" style={{ marginLeft: 8 }}>
                        ¥{scannedProduct.standardPrice}
                      </span>
                      <Tag color="red" style={{ marginLeft: 8 }}>
                        促销价 ¥{scannedProduct.promotionPrice}
                      </Tag>
                    </>
                  )}
                </div>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Tag color="blue">{scannedProduct.category}</Tag>
              </Col>
            </Row>
          </Card>
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            name="actualPrice"
            label="实际售价"
            rules={[{ required: true, message: '请输入实际售价' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              prefix="¥"
              placeholder="请输入实际售价"
            />
          </Form.Item>

          <Form.Item
            name="isCorrect"
            label="价格是否正确"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group>
              <Radio value={true}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> 价格正确
              </Radio>
              <Radio value={false}>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 价格异常
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.isCorrect !== curr.isCorrect}>
            {({ getFieldValue }) =>
              getFieldValue('isCorrect') === false ? (
                <Form.Item
                  name="problemType"
                  label="问题类型"
                  rules={[{ required: true, message: '请选择问题类型' }]}
                >
                  <Select placeholder="请选择问题类型">
                    <Option value="wrong_price">价格错误</Option>
                    <Option value="out_of_stock">商品缺货</Option>
                    <Option value="no_price_tag">无价格标签</Option>
                  </Select>
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="remark" label="问题说明">
            <TextArea rows={3} placeholder="请详细描述问题情况" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PriceCheck;
