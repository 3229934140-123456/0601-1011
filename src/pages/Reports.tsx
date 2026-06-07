import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Select,
  DatePicker,
  Progress,
  Modal,
  message,
  Divider,
  Descriptions,
  List,
  Avatar,
  Space
} from 'antd';
import {
  BarChartOutlined,
  TrophyOutlined,
  DownloadOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { InspectionReport, Store } from '../types';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Reports: React.FC = () => {
  const { reports, stores, rectifications, tasks, user } = useAppStore();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InspectionReport | null>(null);

  const storeScores = stores.map((store) => {
    const storeReports = reports.filter((r) => r.storeId === store.id);
    const avgScore = storeReports.length > 0
      ? storeReports.reduce((sum, r) => sum + r.totalScore, 0) / storeReports.length
      : store.score;
    const problemCount = storeReports.reduce((sum, r) => sum + r.problemCount, 0);
    const rectCount = rectifications.filter((r) => r.storeId === store.id).length;

    return {
      ...store,
      avgScore: Math.round(avgScore),
      problemCount,
      rectCount,
      reportCount: storeReports.length
    };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const handleViewDetail = (report: InspectionReport) => {
    setSelectedReport(report);
    setDetailModal(true);
  };

  const handleExportReport = (report: InspectionReport) => {
    message.success(`正在导出 ${report.storeName} 巡检报告...`);
    setTimeout(() => {
      message.success('报告导出成功！');
    }, 1000);
  };

  const handleExportAll = () => {
    message.success('正在导出区域汇总报告...');
    setTimeout(() => {
      message.success('汇总报告导出成功！');
    }, 1500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#52c41a';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '合格';
    return '不合格';
  };

  const rankColumns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (_: any, __: any, index: number) => {
        if (index === 0) return <TrophyOutlined style={{ color: '#faad14', fontSize: 20 }} />;
        if (index === 1) return <TrophyOutlined style={{ color: '#8c8c8c', fontSize: 20 }} />;
        if (index === 2) return <TrophyOutlined style={{ color: '#d48806', fontSize: 20 }} />;
        return <span style={{ fontWeight: 600 }}>{index + 1}</span>;
      }
    },
    {
      title: '门店名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={32} icon={<ShopOutlined />} style={{ backgroundColor: '#1677ff' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{name}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{record.code}</div>
          </div>
        </div>
      )
    },
    {
      title: '所属路线',
      dataIndex: 'route',
      key: 'route',
      width: 100,
      render: (route: string) => <Tag color="blue">{route}</Tag>
    },
    {
      title: '综合评分',
      dataIndex: 'avgScore',
      key: 'avgScore',
      width: 150,
      render: (score: number) => (
        <div>
          <span style={{ fontSize: 20, fontWeight: 700, color: getScoreColor(score) }}>
            {score}
          </span>
          <span style={{ color: '#999', marginLeft: 4 }}>分</span>
          <Tag color={score >= 90 ? 'green' : score >= 70 ? 'orange' : 'red'} style={{ marginLeft: 8 }}>
            {getScoreLevel(score)}
          </Tag>
        </div>
      )
    },
    {
      title: '巡检次数',
      dataIndex: 'reportCount',
      key: 'reportCount',
      width: 100,
      render: (count: number) => `${count} 次`
    },
    {
      title: '问题数量',
      dataIndex: 'problemCount',
      key: 'problemCount',
      width: 100,
      render: (count: number) => (
        <span style={{ color: count > 5 ? '#ff4d4f' : '#666' }}>{count} 个</span>
      )
    },
    {
      title: '整改项',
      dataIndex: 'rectCount',
      key: 'rectCount',
      width: 100,
      render: (count: number) => `${count} 项`
    }
  ];

  const reportColumns = [
    {
      title: '门店名称',
      dataIndex: 'storeName',
      key: 'storeName',
      width: 180
    },
    {
      title: '巡检日期',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 120
    },
    {
      title: '督导',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 100
    },
    {
      title: '总分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 100,
      render: (score: number) => (
        <span style={{ fontWeight: 600, color: getScoreColor(score) }}>{score}</span>
      )
    },
    {
      title: '价格得分',
      dataIndex: 'priceScore',
      key: 'priceScore',
      width: 100,
      render: (score: number) => (
        <Progress percent={score} size="small" showInfo={false} strokeColor={getScoreColor(score)} />
      )
    },
    {
      title: '促销得分',
      dataIndex: 'promotionScore',
      key: 'promotionScore',
      width: 100,
      render: (score: number) => (
        <Progress percent={score} size="small" showInfo={false} strokeColor={getScoreColor(score)} />
      )
    },
    {
      title: '问题数',
      dataIndex: 'problemCount',
      key: 'problemCount',
      width: 80
    },
    {
      title: '整改数',
      dataIndex: 'rectificationCount',
      key: 'rectificationCount',
      width: 80
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: InspectionReport) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleExportReport(record)}>
            导出
          </Button>
        </Space>
      )
    }
  ];

  const avgTotalScore = storeScores.length > 0
    ? Math.round(storeScores.reduce((sum, s) => sum + s.avgScore, 0) / storeScores.length)
    : 0;
  const totalProblems = storeScores.reduce((sum, s) => sum + s.problemCount, 0);
  const totalRects = storeScores.reduce((sum, s) => sum + s.rectCount, 0);
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">统计报表</h2>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as any)}
            style={{ width: 280 }}
          />
          <Button icon={<DownloadOutlined />} type="primary" onClick={handleExportAll}>
            导出汇总报告
          </Button>
        </Space>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#1677ff' }}>
              {avgTotalScore}
              <span style={{ fontSize: 14, fontWeight: 400, color: '#999' }}> 分</span>
            </div>
            <div className="stat-label">区域平均分</div>
            <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
              <RiseOutlined /> 较上月 +3.2 分
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#52c41a' }}>
              {storeScores.filter((s) => s.avgScore >= 90).length}
            </div>
            <div className="stat-label">优秀门店</div>
            <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
              占比 {storeScores.length > 0 ? Math.round((storeScores.filter((s) => s.avgScore >= 90).length / storeScores.length) * 100) : 0}%
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#faad14' }}>
              {totalProblems}
            </div>
            <div className="stat-label">累计问题数</div>
            <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
              <FallOutlined /> 较上月 -8 个
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#722ed1' }}>
              {completedTasks}
            </div>
            <div className="stat-label">已完成任务</div>
            <div style={{ marginTop: 8, color: '#666', fontSize: 12 }}>
              完成率 {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
            </div>
          </div>
        </Col>
      </Row>

      <Card
        className="card-section"
        title={<span><TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />区域门店排名</span>}
        extra={<Tag color="blue">{user.area}</Tag>}
      >
        <Table
          columns={rankColumns}
          dataSource={storeScores}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Card
        className="card-section"
        title={<span><FileTextOutlined style={{ marginRight: 8 }} />巡检报告列表</span>}
      >
        <Table
          columns={reportColumns}
          dataSource={reports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="巡检报告详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="export" icon={<DownloadOutlined />} onClick={() => selectedReport && handleExportReport(selectedReport)}>
            导出报告
          </Button>,
          <Button key="close" onClick={() => setDetailModal(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        {selectedReport && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 20 }}>
              <Descriptions.Item label="门店名称" span={2}>
                {selectedReport.storeName}
              </Descriptions.Item>
              <Descriptions.Item label="巡检日期">{selectedReport.inspectionDate}</Descriptions.Item>
              <Descriptions.Item label="督导">{selectedReport.inspector}</Descriptions.Item>
            </Descriptions>

            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: getScoreColor(selectedReport.totalScore) }}>
                    {selectedReport.totalScore}
                  </div>
                  <div style={{ color: '#666', fontSize: 13 }}>综合评分</div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: getScoreColor(selectedReport.priceScore) }}>
                    {selectedReport.priceScore}
                  </div>
                  <div style={{ color: '#666', fontSize: 13 }}>价格检查得分</div>
                  <Progress percent={selectedReport.priceScore} size="small" strokeColor={getScoreColor(selectedReport.priceScore)} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: getScoreColor(selectedReport.promotionScore) }}>
                    {selectedReport.promotionScore}
                  </div>
                  <div style={{ color: '#666', fontSize: 13 }}>促销核验得分</div>
                  <Progress percent={selectedReport.promotionScore} size="small" strokeColor={getScoreColor(selectedReport.promotionScore)} />
                </Card>
              </Col>
            </Row>

            <Divider orientation="left">检查概览</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <List size="small">
                  <List.Item>
                    <List.Item.Meta title="发现问题数量" description={`${selectedReport.problemCount} 个`} />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta title="发出整改项" description={`${selectedReport.rectificationCount} 项`} />
                  </List.Item>
                </List>
              </Col>
              <Col span={12}>
                <List size="small">
                  <List.Item>
                    <List.Item.Meta title="累计扣分数" description={`${100 - selectedReport.totalScore} 分`} />
                  </List.Item>
                  <List.Item>
                    <List.Item.Meta title="整改完成率" description="85%" />
                  </List.Item>
                </List>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
