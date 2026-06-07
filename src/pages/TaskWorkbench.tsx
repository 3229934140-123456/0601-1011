import React, { useMemo, useState } from 'react';
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
  message,
  Modal,
  Alert
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
  CalendarOutlined,
  WarningOutlined,
  InfoCircleOutlined
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
    addReport,
    setCurrentTask
  } = useAppStore();

  const [confirmModal, setConfirmModal] = useState(false);

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
      total += 50;
      completed += priceProgress * 0.5;
    }
    if (task.type === 'promotion' || task.type === 'comprehensive') {
      total += 30;
      completed += promotionProgress * 0.3;
    }
    total += 20;
    completed += Math.min(taskPhotos.length * 4, 20);

    return total > 0 ? Math.round(completed) : 0;
  }, [task.type, priceProgress, promotionProgress, taskPhotos.length]);

  const priceScore = taskPriceRecords.length > 0
    ? Math.max(0, Math.round(100 - ((taskPriceRecords.length - priceCorrectCount) * 2)))
    : 100;

  const promotionScore = taskPromotionRecords.length > 0
    ? Math.max(0, Math.round(100 - ((taskPromotionRecords.length - promotionCorrectCount) * 3)))
    : 100;

  const totalScore = useMemo(() => {
    if (task.type === 'price') {
      return priceScore;
    } else if (task.type === 'promotion') {
      return promotionScore;
    } else {
      return Math.round((priceScore + promotionScore) / 2);
    }
  }, [task.type, priceScore, promotionScore]);

  const todoList = useMemo(() => {
    const todos: { title: string; status: 'done' | 'warning' | 'info'; desc: string }[] = [];

    if (task.type === 'price' || task.type === 'comprehensive') {
      if (taskPriceRecords.length === 0) {
        todos.push({
          title: '完成商品核价',
          status: 'warning',
          desc: '尚未核价任何商品'
        });
      } else if (taskPriceRecords.length < 10) {
        todos.push({
          title: '增加核价数量',
          status: 'info',
          desc: `已核价 ${taskPriceRecords.length} 条，建议至少10条`
        });
      } else {
        todos.push({
          title: '商品核价',
          status: 'done',
          desc: `已核价 ${taskPriceRecords.length} 条，正确率 ${priceAccuracy}%`
        });
      }
    }

    if (task.type === 'promotion' || task.type === 'comprehensive') {
      if (taskPromotionRecords.length === 0) {
        todos.push({
          title: '完成促销核验',
          status: 'warning',
          desc: '尚未核验任何促销商品'
        });
      } else if (taskPromotionRecords.length < 3) {
        todos.push({
          title: '增加促销核验数量',
          status: 'info',
          desc: `已核验 ${taskPromotionRecords.length} 条，建议至少3条`
        });
      } else {
        todos.push({
          title: '促销核验',
          status: 'done',
          desc: `已核验 ${taskPromotionRecords.length} 条，合规率 ${promotionAccuracy}%`
        });
      }
    }

    if (taskPhotos.length === 0) {
      todos.push({
        title: '上传现场照片',
        status: 'warning',
        desc: '建议至少上传1张现场照片作为证据'
      });
    } else {
      todos.push({
        title: '照片证据',
        status: 'done',
        desc: `已上传 ${taskPhotos.length} 张照片`
      });
    }

    const pendingRects = taskRectifications.filter((r) => r.status === 'pending');
    if (pendingRects.length > 0) {
      todos.push({
        title: '处理待分配整改项',
        status: 'warning',
        desc: `有 ${pendingRects.length} 个整改项待分配负责人`
      });
    }

    const abnormalCount = taskPriceRecords.filter(r => !r.isCorrect).length + 
                          taskPromotionRecords.filter(r => !r.isCorrect).length;
    if (abnormalCount > 0 && taskRectifications.length === 0) {
      todos.push({
        title: '创建整改项',
        status: 'info',
        desc: `发现 ${abnormalCount} 个问题，建议创建整改项跟进`
      });
    }

    if (todos.every((t) => t.status === 'done')) {
      todos.push({
        title: '巡检已准备完成',
        status: 'done',
        desc: '所有检查项已完成，可以提交报告'
      });
    }

    return todos;
  }, [task.type, taskPriceRecords.length, taskPromotionRecords.length, taskPhotos.length, taskRectifications, priceAccuracy, promotionAccuracy]);

  const canComplete = useMemo(() => {
    const hasCheckRecords = task.type === 'price' 
      ? taskPriceRecords.length > 0
      : task.type === 'promotion'
      ? taskPromotionRecords.length > 0
      : taskPriceRecords.length > 0 || taskPromotionRecords.length > 0;
    return hasCheckRecords;
  }, [task.type, taskPriceRecords.length, taskPromotionRecords.length]);

  const handleBack = () => {
    navigate('/tasks');
  };

  const handleCompleteTask = () => {
    if (!canComplete) {
      message.warning('请至少完成一项检查后再提交');
      return;
    }
    setConfirmModal(true);
  };

  const confirmCompleteTask = () => {
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
    setConfirmModal(false);
    message.success('巡检完成，报告已生成');
    navigate('/reports');
  };

  const quickActions = useMemo(() => {
    const actions: any[] = [];

    if (task.type === 'price' || task.type === 'comprehensive') {
      actions.push({
        key: 'price',
        title: '商品核价',
        icon: <ScanOutlined />,
        count: taskPriceRecords.length,
        progress: priceProgress,
        color: '#1677ff',
        path: '/price-check'
      });
    }

    if (task.type === 'promotion' || task.type === 'comprehensive') {
      actions.push({
        key: 'promotion',
        title: '促销核验',
        icon: <TagsOutlined />,
        count: taskPromotionRecords.length,
        progress: promotionProgress,
        color: '#722ed1',
        path: '/promotion-check'
      });
    }

    actions.push({
      key: 'photos',
      title: '拍照取证',
      icon: <CameraOutlined />,
      count: taskPhotos.length,
      progress: Math.min(taskPhotos.length * 4, 100),
      color: '#faad14',
      path: '/photos'
    });

    actions.push({
      key: 'rectification',
      title: '整改跟踪',
      icon: <ToolOutlined />,
      count: taskRectifications.length,
      progress: taskRectifications.length > 0 ? 100 : 0,
      color: '#ff4d4f',
      path: '/rectification'
    });

    return actions;
  }, [task.type, taskPriceRecords.length, taskPromotionRecords.length, taskPhotos.length, taskRectifications.length, priceProgress, promotionProgress]);

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
            title={<span><CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />待办清单</span>}
            className="card-section"
          >
            <div style={{ textAlign: 'center', marginBottom: 12, padding: '8px 0', background: '#f9f9f9', borderRadius: 6 }}>
              <span style={{ fontSize: 12, color: '#999' }}>预计得分</span>
              <span style={{ fontSize: 28, fontWeight: 700, marginLeft: 8, color: totalScore >= 90 ? '#52c41a' : totalScore >= 70 ? '#faad14' : '#ff4d4f' }}>
                {totalScore}
              </span>
              <Tag
                color={totalScore >= 90 ? 'green' : totalScore >= 80 ? 'blue' : totalScore >= 70 ? 'orange' : 'red'}
                style={{ marginLeft: 6 }}
              >
                {totalScore >= 90 ? '优秀' : totalScore >= 80 ? '良好' : totalScore >= 70 ? '合格' : '不合格'}
              </Tag>
            </div>

            <List
              size="small"
              dataSource={todoList}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <List.Item.Meta
                    avatar={
                      item.status === 'done' ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} /> :
                      item.status === 'warning' ? <WarningOutlined style={{ color: '#faad14', fontSize: 18 }} /> :
                      <InfoCircleOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                    }
                    title={<span style={{ fontSize: 13, fontWeight: 500 }}>{item.title}</span>}
                    description={<span style={{ fontSize: 12, color: '#999' }}>{item.desc}</span>}
                  />
                </List.Item>
              )}
            />
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

      <Modal
        title="确认完成巡检"
        open={confirmModal}
        onOk={confirmCompleteTask}
        onCancel={() => setConfirmModal(false)}
        okText="确认生成报告"
        cancelText="取消"
        width={520}
      >
        <Alert
          message="确认生成巡检报告？"
          description="生成报告后任务将标记为已完成，报告将自动同步到统计报表中。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Divider style={{ margin: '12px 0' }} />
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="门店名称" span={2}>{task.storeName}</Descriptions.Item>
          <Descriptions.Item label="任务类型">
            {task.type === 'price' ? '价格检查' : task.type === 'promotion' ? '促销核验' : '综合巡检'}
          </Descriptions.Item>
          <Descriptions.Item label="预计得分">
            <span style={{ fontWeight: 600, color: totalScore >= 90 ? '#52c41a' : totalScore >= 70 ? '#faad14' : '#ff4d4f' }}>
              {totalScore} 分
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="核价记录">{taskPriceRecords.length} 条</Descriptions.Item>
          <Descriptions.Item label="促销核验">{taskPromotionRecords.length} 条</Descriptions.Item>
          <Descriptions.Item label="照片证据">{taskPhotos.length} 张</Descriptions.Item>
          <Descriptions.Item label="问题数量">
            {taskPriceRecords.filter(r => !r.isCorrect).length + taskPromotionRecords.filter(r => !r.isCorrect).length} 个
          </Descriptions.Item>
          <Descriptions.Item label="整改项">{taskRectifications.length} 项</Descriptions.Item>
        </Descriptions>
        {todoList.some(t => t.status === 'warning') && (
          <Alert
            message="有待处理事项"
            description={todoList.filter(t => t.status === 'warning').map(t => t.desc).join('；')}
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default TaskWorkbench;
