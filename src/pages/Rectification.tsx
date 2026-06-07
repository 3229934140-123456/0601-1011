import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tabs,
  Tag,
  Button,
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  InputNumber,
  message,
  Timeline,
  Badge,
  Divider,
  Descriptions,
  Space,
  Radio
} from 'antd';
import {
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { RectificationItem } from '../types';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const Rectification: React.FC = () => {
  const {
    rectifications,
    addRectification,
    updateRectification,
    replyRectification,
    verifyRectification,
    stores,
    tasks,
    user,
    currentRectificationId,
    setCurrentRectificationId
  } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [replyModal, setReplyModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RectificationItem | null>(null);
  const [form] = Form.useForm();
  const [replyForm] = Form.useForm();
  const [verifyForm] = Form.useForm();

  const getStatusConfig = (status: RectificationItem['status']) => {
    const configs = {
      pending: { color: 'default', text: '待处理', icon: <ClockCircleOutlined /> },
      processing: { color: 'processing', text: '处理中', icon: <ToolOutlined /> },
      replied: { color: 'warning', text: '待复核', icon: <MessageOutlined /> },
      verified: { color: 'success', text: '已复核', icon: <CheckCircleOutlined /> },
      closed: { color: 'default', text: '已关闭', icon: <CheckCircleOutlined /> }
    };
    return configs[status];
  };

  const getTypeConfig = (type: RectificationItem['type']) => {
    const configs = {
      price: { color: 'blue', text: '价格问题' },
      promotion: { color: 'purple', text: '促销问题' },
      display: { color: 'cyan', text: '陈列问题' },
      other: { color: 'default', text: '其他问题' }
    };
    return configs[type];
  };

  const filteredItems = rectifications.filter((item) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  const handleCreate = () => {
    form.resetFields();
    setCreateModal(true);
  };

  const handleSubmitCreate = () => {
    form.validateFields().then((values) => {
      const store = stores.find((s) => s.id === values.storeId);
      const task = tasks.find((t) => t.id === values.taskId);

      const newItem: RectificationItem = {
        id: `r${Date.now()}`,
        taskId: values.taskId,
        storeId: values.storeId,
        storeName: store?.name || '',
        title: values.title,
        description: values.description,
        type: values.type,
        status: 'pending',
        assignee: values.assignee,
        deadline: values.deadline.format('YYYY-MM-DD'),
        createdTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        points: values.points
      };

      addRectification(newItem);
      message.success('整改项已创建');
      setCreateModal(false);
    });
  };

  useEffect(() => {
    if (currentRectificationId) {
      const item = rectifications.find((r) => r.id === currentRectificationId);
      if (item) {
        setSelectedItem(item);
        setDetailModal(true);
        if (item.status !== 'all') {
          setActiveTab(item.status);
        }
      }
      setCurrentRectificationId(null);
    }
  }, [currentRectificationId, rectifications, setCurrentRectificationId]);

  const handleViewDetail = (item: RectificationItem) => {
    setSelectedItem(item);
    setDetailModal(true);
  };

  const handleReply = (item: RectificationItem) => {
    setSelectedItem(item);
    replyForm.resetFields();
    setReplyModal(true);
  };

  const handleSubmitReply = () => {
    replyForm.validateFields().then((values) => {
      if (selectedItem) {
        replyRectification(selectedItem.id, values.content);
        message.success('回复已提交');
        setReplyModal(false);
      }
    });
  };

  const handleVerify = (item: RectificationItem) => {
    setSelectedItem(item);
    verifyForm.resetFields();
    setVerifyModal(true);
  };

  const handleSubmitVerify = () => {
    verifyForm.validateFields().then((values) => {
      if (selectedItem) {
        verifyRectification(selectedItem.id, values.result, values.remark);
        message.success(values.result === 'pass' ? '复核通过' : '需重新整改');
        setVerifyModal(false);
      }
    });
  };

  const stats = [
    { label: '全部整改', value: rectifications.length, color: '#1677ff' },
    {
      label: '待处理',
      value: rectifications.filter((r) => r.status === 'pending').length,
      color: '#faad14'
    },
    {
      label: '处理中',
      value: rectifications.filter((r) => r.status === 'processing').length,
      color: '#1677ff'
    },
    {
      label: '待复核',
      value: rectifications.filter((r) => r.status === 'replied').length,
      color: '#722ed1'
    },
    {
      label: '已完成',
      value: rectifications.filter((r) => r.status === 'verified' || r.status === 'closed').length,
      color: '#52c41a'
    },
    {
      label: '累计扣分',
      value: rectifications.reduce((sum, r) => sum + r.points, 0),
      color: '#ff4d4f'
    }
  ];

  const getTimelineItems = (item: RectificationItem) => {
    const items = [
      {
        color: 'blue',
        dot: <ClockCircleOutlined />,
        children: (
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>创建整改项</p>
            <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{item.createdTime}</p>
          </div>
        )
      }
    ];

    if (item.status !== 'pending') {
      items.push({
        color: 'processing',
        dot: <ToolOutlined />,
        children: (
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>开始处理</p>
            <p style={{ margin: 0, color: '#999', fontSize: 12 }}>负责人: {item.assignee}</p>
          </div>
        )
      });
    }

    if (item.replyTime) {
      items.push({
        color: 'orange',
        dot: <MessageOutlined />,
        children: (
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>门店回复</p>
            <p style={{ margin: 0, color: '#666' }}>{item.replyContent}</p>
            <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{item.replyTime}</p>
          </div>
        )
      });
    }

    if (item.verifyTime) {
      items.push({
        color: item.verifyResult === 'pass' ? 'green' : 'red',
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <p style={{ margin: 0, fontWeight: 500 }}>
              复核{
              item.verifyResult === 'pass' ? '通过' : '不通过'}
            </p>
            <p style={{ margin: 0, color: '#666' }}>{item.verifyRemark}</p>
            <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{item.verifyTime}</p>
          </div>
        )
      });
    }

    return items;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">整改跟踪</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          创建整改
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col span={4} key={index}>
            <div className="stat-card">
              <div className="stat-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      <Card className="card-section">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="待处理" key="pending" />
          <TabPane tab="处理中" key="processing" />
          <TabPane tab="待复核" key="replied" />
          <TabPane tab="已完成" key="verified" />
        </Tabs>

        {filteredItems.map((item) => {
          const statusConfig = getStatusConfig(item.status);
          const typeConfig = getTypeConfig(item.type);
          const isOverdue = dayjs().isAfter(dayjs(item.deadline)) && item.status !== 'verified' && item.status !== 'closed';

          return (
            <div
              key={item.id}
              className="task-card"
              onClick={() => handleViewDetail(item)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{item.title}</h3>
                    <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
                    <Tag color={statusConfig.color}>
                      {statusConfig.icon} {statusConfig.text}
                    </Tag>
                    {isOverdue && <Badge status="error" text="已逾期" />}
                    <Tag color="red" icon={<ExclamationCircleOutlined />}>扣 {item.points} 分</Tag>
                  </div>
                  <div style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
                    {item.description}
                  </div>
                  <div style={{ display: 'flex', gap: 24, color: '#666', fontSize: 13 }}>
                    <span>门店: {item.storeName}</span>
                    <span>
                      <UserOutlined style={{ marginRight: 4 }} />
                      负责人: {item.assignee}
                    </span>
                    <span>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      截止: {item.deadline}
                    </span>
                  </div>
                </div>
                <Space>
                  {item.status === 'pending' && (
                    <Button
                      type="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRectification(item.id, { status: 'processing' });
                        message.success('已开始处理');
                      }}
                    >
                      开始处理
                    </Button>
                  )}
                  {(item.status === 'pending' || item.status === 'processing') && (
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReply(item);
                      }}
                    >
                      回复
                    </Button>
                  )}
                  {item.status === 'replied' && (
                    <Button
                      type="primary"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerify(item);
                      }}
                    >
                      复核
                    </Button>
                  )}
                  <Button size="small" onClick={(e) => { e.stopPropagation(); handleViewDetail(item); }}>
                    详情
                  </Button>
                </Space>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <ToolOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>暂无整改记录</p>
          </div>
        )}
      </Card>

      <Modal
        title="创建整改项"
        open={createModal}
        onOk={handleSubmitCreate}
        onCancel={() => setCreateModal(false)}
        okText="创建"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="storeId"
                label="门店"
                rules={[{ required: true, message: '请选择门店' }]}
              >
                <Select placeholder="请选择门店">
                  {stores.map((store) => (
                    <Option key={store.id} value={store.id}>
                      {store.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="taskId"
                label="关联任务"
                rules={[{ required: true, message: '请选择任务' }]}
              >
                <Select placeholder="请选择巡检任务">
                  {tasks.map((task) => (
                    <Option key={task.id} value={task.id}>
                      {task.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="title"
            label="问题标题"
            rules={[{ required: true, message: '请输入问题标题' }]}
          >
            <Input placeholder="请简要描述问题" />
          </Form.Item>
          <Form.Item
            name="type"
            label="问题类型"
            rules={[{ required: true, message: '请选择问题类型' }]}
          >
            <Select placeholder="请选择问题类型">
              <Option value="price">价格问题</Option>
              <Option value="promotion">促销问题</Option>
              <Option value="display">陈列问题</Option>
              <Option value="other">其他问题</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="详细描述"
            rules={[{ required: true, message: '请输入详细描述' }]}
          >
            <TextArea rows={3} placeholder="请详细描述问题情况" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignee"
                label="整改负责人"
                rules={[{ required: true, message: '请选择负责人' }]}
              >
                <Select placeholder="请选择负责人">
                  {stores.map((store) => (
                    <Option key={store.manager} value={store.manager}>
                      {store.manager} ({store.name})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="deadline"
                label="整改期限"
                rules={[{ required: true, message: '请选择整改期限' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                name="points"
                label="扣分"
                rules={[{ required: true, message: '请输入扣分数' }]}
              >
                <InputNumber min={0} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="整改详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedItem && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="问题标题" span={2}>
                {selectedItem.title}
              </Descriptions.Item>
              <Descriptions.Item label="问题类型">
                {getTypeConfig(selectedItem.type).text}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                {getStatusConfig(selectedItem.status).text}
              </Descriptions.Item>
              <Descriptions.Item label="所属门店">{selectedItem.storeName}</Descriptions.Item>
              <Descriptions.Item label="负责人">{selectedItem.assignee}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedItem.createdTime}</Descriptions.Item>
              <Descriptions.Item label="整改期限">{selectedItem.deadline}</Descriptions.Item>
              <Descriptions.Item label="扣分" span={2}>
                <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{selectedItem.points} 分</span>
              </Descriptions.Item>
              <Descriptions.Item label="问题描述" span={2}>
                {selectedItem.description}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">处理进度</Divider>
            <Timeline items={getTimelineItems(selectedItem)} />
          </div>
        )}
      </Modal>

      <Modal
        title="回复整改"
        open={replyModal}
        onOk={handleSubmitReply}
        onCancel={() => setReplyModal(false)}
        okText="提交回复"
        cancelText="取消"
      >
        <Form form={replyForm} layout="vertical">
          <Form.Item
            name="content"
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请描述整改措施和完成情况"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="复核整改"
        open={verifyModal}
        onOk={handleSubmitVerify}
        onCancel={() => setVerifyModal(false)}
        okText="提交复核"
        cancelText="取消"
      >
        <Form form={verifyForm} layout="vertical">
          <Form.Item
            name="result"
            label="复核结果"
            rules={[{ required: true, message: '请选择复核结果' }]}
          >
            <Radio.Group>
              <Radio value="pass">
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> 复核通过
              </Radio>
              <Radio value="fail">
                <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} /> 需重新整改
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="remark"
            label="复核意见"
            rules={[{ required: true, message: '请输入复核意见' }]}
          >
            <TextArea rows={3} placeholder="请填写复核意见" maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Rectification;
