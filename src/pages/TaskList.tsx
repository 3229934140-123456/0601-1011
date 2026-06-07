import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Tabs,
  Tag,
  Button,
  Progress,
  Modal,
  Form,
  Select,
  DatePicker,
  List,
  Badge
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  ShopOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { InspectionTask } from '../types';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { Option } = Select;

const TaskList: React.FC = () => {
  const { tasks, user, claimTask, setCurrentTask } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [claimModal, setClaimModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InspectionTask | null>(null);
  const [form] = Form.useForm();

  const getStatusConfig = (status: InspectionTask['status']) => {
    const configs = {
      pending: { color: 'default', text: '待领取', icon: <ClockCircleOutlined /> },
      in_progress: { color: 'processing', text: '进行中', icon: <PlayCircleOutlined /> },
      completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
      overdue: { color: 'error', text: '已逾期', icon: <ExclamationCircleOutlined /> }
    };
    return configs[status];
  };

  const getPriorityConfig = (priority: InspectionTask['priority']) => {
    const configs = {
      high: { color: 'red', text: '高优先级' },
      medium: { color: 'orange', text: '中优先级' },
      low: { color: 'green', text: '低优先级' }
    };
    return configs[priority];
  };

  const getTypeConfig = (type: InspectionTask['type']) => {
    const configs = {
      price: { color: 'blue', text: '价格检查' },
      promotion: { color: 'purple', text: '促销核验' },
      comprehensive: { color: 'cyan', text: '综合巡检' }
    };
    return configs[type];
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return task.status === 'pending';
    if (activeTab === 'in_progress') return task.status === 'in_progress';
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'my') return task.inspector === user.name;
    return true;
  });

  const handleClaim = (task: InspectionTask) => {
    setSelectedTask(task);
    setClaimModal(true);
  };

  const handleConfirmClaim = () => {
    if (selectedTask) {
      claimTask(selectedTask.id, user.name);
      setClaimModal(false);
      setSelectedTask(null);
    }
  };

  const handleStartTask = (task: InspectionTask) => {
    setCurrentTask(task);
  };

  const stats = [
    { label: '全部任务', value: tasks.length, icon: <ClockCircleOutlined />, color: '#1677ff' },
    {
      label: '待领取',
      value: tasks.filter((t) => t.status === 'pending').length,
      icon: <ClockCircleOutlined />,
      color: '#faad14'
    },
    {
      label: '进行中',
      value: tasks.filter((t) => t.status === 'in_progress').length,
      icon: <PlayCircleOutlined />,
      color: '#1677ff'
    },
    {
      label: '已完成',
      value: tasks.filter((t) => t.status === 'completed').length,
      icon: <CheckCircleOutlined />,
      color: '#52c41a'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">巡店任务</h2>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col span={6} key={index}>
            <div className="stat-card">
              <div
                style={{
                  fontSize: 36,
                  color: stat.color,
                  marginBottom: 8
                }}
              >
                {stat.icon}
              </div>
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
          <TabPane tab="全部任务" key="all" />
          <TabPane tab="待领取" key="pending" />
          <TabPane tab="进行中" key="in_progress" />
          <TabPane tab="已完成" key="completed" />
          <TabPane tab="我的任务" key="my" />
        </Tabs>

        <List
          dataSource={filteredTasks}
          renderItem={(task) => {
            const statusConfig = getStatusConfig(task.status);
            const priorityConfig = getPriorityConfig(task.priority);
            const typeConfig = getTypeConfig(task.type);
            const isOverdue = dayjs().isAfter(dayjs(task.deadline)) && task.status !== 'completed';

            return (
              <div
                className={`task-card ${task.priority}`}
                onClick={() => setCurrentTask(task)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{task.title}</h3>
                      <Tag color={priorityConfig.color}>{priorityConfig.text}</Tag>
                      <Tag color={typeConfig.color}>{typeConfig.text}</Tag>
                      <Tag color={statusConfig.color}>
                        {statusConfig.icon} {statusConfig.text}
                      </Tag>
                      {isOverdue && (
                        <Badge status="error" text="已逾期" />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 24, color: '#666', fontSize: 13, marginBottom: 12 }}>
                      <span>
                        <ShopOutlined style={{ marginRight: 4 }} />
                        {task.storeName}
                      </span>
                      <span>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        截止: {task.deadline}
                      </span>
                      {task.inspector && <span>督导: {task.inspector}</span>}
                    </div>
                    {task.status === 'in_progress' && (
                      <Progress percent={task.progress} size="small" style={{ maxWidth: 300 }} />
                    )}
                  </div>
                  <div>
                    {task.status === 'pending' && (
                      <Button type="primary" onClick={(e) => { e.stopPropagation(); handleClaim(task); }}>
                        领取任务
                      </Button>
                    )}
                    {task.status === 'in_progress' && task.inspector === user.name && (
                      <Button type="primary" onClick={(e) => { e.stopPropagation(); handleStartTask(task); }}>
                        继续巡检
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <Button onClick={(e) => { e.stopPropagation(); }}>查看详情</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
        />

        {filteredTasks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <WarningOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>暂无任务数据</p>
          </div>
        )}
      </Card>

      <Modal
        title="领取任务"
        open={claimModal}
        onOk={handleConfirmClaim}
        onCancel={() => setClaimModal(false)}
        okText="确认领取"
        cancelText="取消"
      >
        {selectedTask && (
          <div>
            <p style={{ marginBottom: 16 }}>
              确定要领取任务 <strong>{selectedTask.title}</strong> 吗？
            </p>
            <div style={{ color: '#666', fontSize: 13 }}>
              <p>门店: {selectedTask.storeName}</p>
              <p>截止日期: {selectedTask.deadline}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskList;
