import React, { useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Progress,
  Button,
  Tag,
  Descriptions,
  Divider,
  Space,
  Statistic,
  List,
  message
} from 'antd';
import {
  ShopOutlined,
  ScanOutlined,
  TagsOutlined,
  CameraOutlined,
  ToolOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { InspectionTask } from '../types';
import dayjs from 'dayjs';

interface TaskWorkbenchProps {
  task: InspectionTask;
}

const TaskWorkbench: React.FC<TaskWorkbenchProps> = ({ task }) => {
  const navigate = useNavigate();
  const {
    stores,
    priceRecords,
    promotionRecords,
    photos,
    rectifications,
    products,
    completeTask,
    addReport
  } = useAppStore();

  const store = stores.find((s) => s.id === task.storeId);

  const taskPriceRecords = useMemo(
    () => priceRecords.filter((r) => r.taskId === task.id),
    [priceRecords, task.id]
  );

  const taskPromotionRecords = useMemo(
    () => promotionRecords.filter((r) => r.taskId === task.id),
    [promotionRecords, task.id]
  );

  const taskPhotos = useMemo(
    () => photos.filter((p) => p.taskId === task.id),
    [photos, task.id]
  );

  const taskRectifications = useMemo(
    () => rectifications.filter((r) => r.taskId === task.id),
    [rectifications, task.id]
  );

  const promotionProducts = products.filter(
    (p) => p.promotionPrice && p.promotionStartDate && p.promotionEndDate
  );

  const priceCorrectCount = taskPriceRecords.filter((r) => r.isCorrect).length;
  const priceAccuracy = taskPriceRecords.length > 0
    ? Math.round((priceCorrectCount / taskPriceRecords.length) * 100)
    : 0;

  const promotionCorrectCount = taskPromotionRecords.filter((r) => r.isCorrect).length;
  const promotionAccuracy = taskPromotionRecords.length > 0
    ? Math.round((promotionCorrectCount / taskPromotionRecords.length) * 100)
    : 0;

  const priceProgress = task.type === 'price' || task.type === 'comprehensive'
    ? Math.min(Math.round((taskPriceRecords.length / 20) * 100), 100)
    : 0;

  const promotionProgress = task.type === 'promotion' || task.type === 'comprehensive'
    ? Math.min(Math.round((taskPromotionRecords.length / promotionProducts.length) * 100), 100)
    : 0;

  const overallProgress = useMemo(() => {
    let total = 0;
    let completed = 0;

    if (task.type === 'price' || task.type === 'comprehensive') {
      total += 40;
      completed += priceProgress * 0.4;
    }
    if (task.type === 'promotion' || task.type === 'comprehensive') {
      total += 40;
      completed += promotionProgress * 0.4;
    }
    total += 20;
    completed += Math.min(taskPhotos.length * 2, 20);

    return total > 0 ? Math.round(completed) : 0;
  }, [task.type, priceProgress, promotionProgress, taskPhotos.length]);

  const priceScore = taskPriceRecords.length > 0
    ? Math.round(100 - ((taskPriceRecords.length - priceCorrectCount) * 2))
    : 100;

  const promotionScore = taskPromotionRecords.length > 0
    ? Math.round(100 - ((taskPromotionRecords.length - promotionCorrectCount) * 3))
    : 100;

  const totalScore = Math.round((priceScore + promotionScore) / 2);

  const handleBack = () => {
    navigate('/tasks');
  };

  const handleCompleteTask = () => {
    if (taskPriceRecords.length === 0 && taskPromotionRecords.length === 0) {
      message.warning('请至少完成一项检查后再提交');
      return;
    }

    const newReport = {
      id: `rpt${Date.now()}`,
      storeId: task.storeId,
      storeName: task.storeName,
      taskId: task.id,
      inspector: task.inspector || '',
      inspectionDate: dayjs().format('YYYY-MM-DD'),
      totalScore,
      priceScore,
      promotionScore,
      problemCount: taskPriceRecords.filter(r => !r.isCorrect).length + taskPromotionRecords.filter(r => !r.isCorrect).length,
      rectificationCount: taskRectifications.length
    };

    addReport(newReport);
    completeTask(task.id);
    message.success('巡检完成，报告已生成');
    navigate('/reports');
  };

  const quickActions = [
    {
      key: 'price',
      title: '商品核价',
      icon: <ScanOutlined />,
      count: taskPriceRecords.length,
      progress: priceProgress,
      color: '#1677ff',
      path: '/price-check'
    },
    {
      key: 'promotion',
      title: '促销核验',
      icon: <TagsOutlined />,
      count: taskPromotionRecords.length,
      progress: promotionProgress,
      color: '#722ed1',
      path: '/promotion-check'
    },
    {
      key: 'photos',
      title: '拍照取证',
      icon: <CameraOutlined />,
      count: taskPhotos.length,
      progress: Math.min(taskPhotos.length * 5, 100),
      color: '#faad14',
      path: '/photos'
    },
    {
      key: 'rectification',
      title: '整改跟踪',
      icon: <ToolOutlined />,
      count: taskRectifications.length,
      progress: taskRectifications.length > 0 ? 100 : 0,
      color: '#ff4d4f',
      path: '/rectification'
    }
  ];

  const isOverdue = dayjs().isAfter(dayjs(task.deadline)) && task.status !== 'completed';

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          >
            返回任务列表
          </Button>
          <h2 className="page-title" style={{ margin: 0 }}>巡检工作台</h2>
        </div>
        <Space>
          {isOverdue && <Tag color="red">已逾期</Tag>}
          <Tag color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}>
            {task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级'}
          </Tag>
          <Tag color="blue">
            {task.type === 'price' ? '价格检查' : task.type === 'promotion' ? '促销核验' : '综合巡检'}
          </Tag>
        </Space>
      </div>

      <Card className="card-section" style={{ marginBottom: 24 }}>
        <Row gutter={24} align="middle">
          <Col span={12}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: '#e6f4ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  color: '#1677ff'
                }}
              >
                <ShopOutlined />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 20 }}>{task.title}</h2>
                <p style={{ margin: '4px 0 0', color: '#666' }}>{task.storeName}</p>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>总体进度</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16 }}>
                <Progress
                  type="circle"
                  percent={overallProgress}
                  size={80}
                  strokeColor="#1677ff"
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>{overallProgress}%</div>
                  <div style={{ fontSize: 12, color: '#999' }}>预计得分: {totalScore} 分</div>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        <Divider style={{ margin: '20px 0' }} />

        <Descriptions column={3} size="small">
          <Descriptions.Item label="门店编码">{store?.code || '-'}</Descriptions.Item>
          <Descriptions.Item label="门店地址">{store?.address || '-'}</Descriptions.Item>
          <Descriptions.Item label="店长">{store?.manager || '-'}</Descriptions.Item>
          <Descriptions.Item label="任务状态">
            <Tag color={task.status === 'completed' ? 'green' : 'processing'}>
              {task.status === 'completed' ? '已完成' : '进行中'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="截止日期">
            <CalendarOutlined style={{ marginRight: 4 }} />
            {task.deadline}
          </Descriptions.Item>
          <Descriptions.Item label="指派日期">{task.assignDate}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {quickActions.map((action) => (
          <Col span={6} key={action.key}>
            <Card
              hoverable
              onClick={() => {
                useAppStore.getState().setCurrentTask(task);
                navigate(action.path);
              }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: `${action.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    color: action.color
                  }}
                >
                  {action.icon}
                </div>
                <div style={{ marginLeft: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{action.title}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>已完成 {action.count} 项</div>
                </div>
              </div>
              <Progress percent={action.progress} size="small" strokeColor={action.color} />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card
            title={<span><PlayCircleOutlined style={{ marginRight: 8, color: '#1677ff' }} />检查进度详情</span>}
            className="card-section"
          >
            <List
              dataSource={quickActions}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: `${item.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 18,
                          color: item.color
                        }}
                      >
                        {item.icon}
                      </div>
                    }
                    title={item.title}
                    description={`已完成 ${item.count} 条记录`}
                  />
                  <div style={{ width: 200 }}>
                    <Progress percent={item.progress} size="small" strokeColor={item.color} />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title={<span><CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />实时评分</span>}
            className="card-section"
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: totalScore >= 90 ? '#52c41a' : totalScore >= 70 ? '#faad14' : '#ff4d4f' }}>
                {totalScore}
              </div>
              <div style={{ color: '#666', fontSize: 13 }}>综合得分（满分100）</div>
              <Tag
                color={totalScore >= 90 ? 'green' : totalScore >= 80 ? 'blue' : totalScore >= 70 ? 'orange' : 'red'}
                style={{ marginTop: 8 }}
              >
                {totalScore >= 90 ? '优秀' : totalScore >= 80 ? '良好' : totalScore >= 70 ? '合格' : '不合格'}
              </Tag>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Row gutter={8}>
              <Col span={12}>
                <Statistic
                  title="价格得分"
                  value={priceScore}
                  valueStyle={{ fontSize: 20, color: priceScore >= 90 ? '#52c41a' : '#ff4d4f' }}
                  suffix="分"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="促销得分"
                  value={promotionScore}
                  valueStyle={{ fontSize: 20, color: promotionScore >= 90 ? '#52c41a' : '#ff4d4f' }}
                  suffix="分"
                />
              </Col>
            </Row>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ fontSize: 13, color: '#666' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>价格正确率</span>
                <span style={{ fontWeight: 500 }}>{priceAccuracy}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>促销合规率</span>
                <span style={{ fontWeight: 500 }}>{promotionAccuracy}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>发现问题数</span>
                <span style={{ fontWeight: 500, color: '#ff4d4f' }}>
                  {taskPriceRecords.filter(r => !r.isCorrect).length + taskPromotionRecords.filter(r => !r.isCorrect).length} 个
                </span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}>
        <Space>
          <Button size="large" onClick={handleBack}>
            稍后继续
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={handleCompleteTask}
            disabled={task.status === 'completed'}
          >
            完成巡检，生成报告
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default TaskWorkbench;
