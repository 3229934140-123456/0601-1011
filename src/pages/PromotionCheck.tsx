import React, { useState } from 'react';
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
  Divider,
  Switch,
  Space
} from 'antd';
import {
  SearchOutlined,
  ScanOutlined,
  TagsOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { Product, PromotionCheckRecord } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const PromotionCheck: React.FC = () => {
  const { products, tasks, promotionRecords, addPromotionRecord, currentTask, stores, user } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [selectedTask, setSelectedTask] = useState(currentTask?.id || '');
  const [checkModal, setCheckModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const taskList = tasks.filter(
    (t) => (t.type === 'promotion' || t.type === 'comprehensive') && t.status === 'in_progress' && t.inspector === user.name
  );

  const currentTaskData = tasks.find((t) => t.id === selectedTask);
  const currentStore = stores.find((s) => s.id === currentTaskData?.storeId);

  const taskRecords = promotionRecords.filter((r) => r.taskId === selectedTask);

  const promotionProducts = products.filter(
    (p) => p.promotionPrice && p.promotionStartDate && p.promotionEndDate
  );

  const handleSearch = () => {
    const product = promotionProducts.find(
      (p) => p.barcode === searchText || p.name.includes(searchText)
    );
    if (product) {
      setSelectedProduct(product);
      setCheckModal(true);
      form.resetFields();
      form.setFieldsValue({
        actualPrice: product.promotionPrice,
        isDisplayed: true,
        isCorrect: true
      });
    } else {
      message.warning('未找到该促销商品');
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
      if (!selectedProduct || !selectedTask || !currentTaskData) return;

      const newRecord: PromotionCheckRecord = {
        id: `pm${Date.now()}`,
        taskId: selectedTask,
        storeId: currentTaskData.storeId,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        promotionType: '直降',
        expectedPrice: selectedProduct.promotionPrice!,
        actualPrice: values.actualPrice,
        isDisplayed: values.isDisplayed,
        isCorrect: values.isCorrect,
        remark: values.remark,
        checkTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
      };

      addPromotionRecord(newRecord);
      message.success('促销核验记录已保存');
      setCheckModal(false);
      setSearchText('');
      setSelectedProduct(null);
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
      title: '促销类型',
      dataIndex: 'promotionType',
      key: 'promotionType',
      width: 100,
      render: (type: string) => <Tag color="purple">{type}</Tag>
    },
    {
      title: '促销价',
      dataIndex: 'expectedPrice',
      key: 'expectedPrice',
      width: 100,
      render: (price: number) => (
        <span style={{ color: '#ff4d4f', fontWeight: 600 }}>¥{price.toFixed(2)}</span>
      )
    },
    {
      title: '实际价',
      dataIndex: 'actualPrice',
      key: 'actualPrice',
      width: 100,
      render: (price: number) => <span>¥{price.toFixed(2)}</span>
    },
    {
      title: '促销标识',
      dataIndex: 'isDisplayed',
      key: 'isDisplayed',
      width: 100,
      render: (displayed: boolean) =>
        displayed ? (
          <Tag color="success">已展示</Tag>
        ) : (
          <Tag color="error">未展示</Tag>
        )
    },
    {
      title: '核验结果',
      dataIndex: 'isCorrect',
      key: 'isCorrect',
      width: 100,
      render: (isCorrect: boolean) =>
        isCorrect ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            合规
          </Tag>
        ) : (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            不合规
          </Tag>
        )
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
        <h2 className="page-title">促销核验</h2>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#722ed1' }}>
              {taskRecords.length}
            </div>
            <div className="stat-label">已核验促销商品</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#52c41a' }}>
              {correctCount}
            </div>
            <div className="stat-label">促销合规</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#ff4d4f' }}>
              {errorCount}
            </div>
            <div className="stat-label">促销不合规</div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#faad14' }}>
              {promotionProducts.length}
            </div>
            <div className="stat-label">应检促销商品</div>
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
          {currentStore && <Tag color="blue">{currentStore.name}</Tag>}
          <div style={{ flex: 1 }} />
        </div>

        <Divider />

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <Input
            size="large"
            prefix={<ScanOutlined />}
            placeholder="扫描或输入促销商品条码"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleScan}
            style={{ flex: 1, maxWidth: 400 }}
          />
          <Button type="primary" size="large" icon={<ScanOutlined />} onClick={handleScan}>
            扫码核验
          </Button>
          <Button size="large" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索商品
          </Button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: '#999', fontSize: 12 }}>
            <TagsOutlined style={{ marginRight: 4 }} />
            当前活动期内共有 {promotionProducts.length} 个促销商品待核验
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={taskRecords}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card
        className="card-section"
        title={<span><TagsOutlined style={{ marginRight: 8 }} />促销商品清单</span>}
      >
        <Row gutter={[16, 16]}>
          {promotionProducts.map((product) => (
            <Col span={8} key={product.id}>
              <Card
                size="small"
                hoverable
                onClick={() => {
                  setSelectedProduct(product);
                  setCheckModal(true);
                  form.resetFields();
                  form.setFieldsValue({
                    actualPrice: product.promotionPrice,
                    isDisplayed: true,
                    isCorrect: true
                  });
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>{product.name}</div>
                    <div style={{ color: '#999', fontSize: 12, marginBottom: 6 }}>
                      {product.barcode}
                    </div>
                    <div>
                      <span className="price-tag">¥{product.promotionPrice?.toFixed(2)}</span>
                      <span className="price-tag original" style={{ marginLeft: 8 }}>
                        ¥{product.standardPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Tag color="red">促销</Tag>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  <ExclamationOutlined style={{ marginRight: 4 }} />
                  {product.promotionStartDate} ~ {product.promotionEndDate}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Modal
        title="促销活动核验"
        open={checkModal}
        onOk={handleAddRecord}
        onCancel={() => setCheckModal(false)}
        okText="保存记录"
        cancelText="取消"
        width={600}
      >
        {selectedProduct && (
          <Card size="small" style={{ marginBottom: 16, background: '#f9f0ff', borderColor: '#d3adf7' }}>
            <Row gutter={16}>
              <Col span={16}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                  {selectedProduct.name}
                </div>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
                  条码: {selectedProduct.barcode} | 规格: {selectedProduct.spec}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="price-tag" style={{ color: '#722ed1' }}>
                    促销价 ¥{selectedProduct.promotionPrice?.toFixed(2)}
                  </span>
                  <span className="price-tag original">¥{selectedProduct.standardPrice.toFixed(2)}</span>
                </div>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <Tag color="purple">{selectedProduct.category}</Tag>
              </Col>
            </Row>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              活动时间: {selectedProduct.promotionStartDate} ~ {selectedProduct.promotionEndDate}
            </div>
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
            name="isDisplayed"
            label="促销标识展示"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group>
              <Radio value={true}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> 有促销标识
              </Radio>
              <Radio value={false}>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 无促销标识
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="isCorrect"
            label="促销执行是否合规"
            rules={[{ required: true, message: '请选择' }]}
          >
            <Radio.Group>
              <Radio value={true}>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> 合规
              </Radio>
              <Radio value={false}>
                <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> 不合规
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="remark" label="问题说明">
            <TextArea rows={3} placeholder="请详细描述促销执行问题" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionCheck;
