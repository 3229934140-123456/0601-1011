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
    const store = stores.find((s) => s.id === report.storeId);
    const rank = storeScores.findIndex((s) => s.id === report.storeId) + 1;

    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${report.storeName} - 巡检报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
    h1 { text-align: center; color: #1677ff; margin-bottom: 8px; }
    .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
    .section { background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .section h2 { margin-top: 0; color: #1f1f1f; font-size: 18px; border-bottom: 2px solid #1677ff; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e8e8e8; }
    .info-label { color: #666; }
    .info-value { font-weight: 500; }
    .score-box { text-align: center; padding: 20px; background: #e6f4ff; border-radius: 8px; margin: 16px 0; }
    .score-value { font-size: 48px; font-weight: 700; color: #1677ff; }
    .score-label { color: #666; margin-top: 4px; }
    .score-breakdown { display: flex; gap: 16px; justify-content: center; margin-top: 16px; }
    .score-item { flex: 1; text-align: center; padding: 12px; background: #fff; border-radius: 6px; }
    .score-item .num { font-size: 24px; font-weight: 600; }
    .rank { display: inline-block; background: #faad14; color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; text-align: center; }
    .stat-item { padding: 16px; background: #fff; border-radius: 8px; }
    .stat-num { font-size: 24px; font-weight: 700; color: #1677ff; }
    .stat-label { font-size: 12px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
    th { background: #fafafa; font-weight: 600; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8; }
    .good { color: #52c41a; }
    .bad { color: #ff4d4f; }
  </style>
</head>
<body>
  <h1>门店巡检报告</h1>
  <p class="subtitle">智慧零售巡店系统 · 生成于 ${new Date().toLocaleString()}</p>

  <div class="section">
    <h2>基本信息</h2>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">门店名称</span><span class="info-value">${report.storeName}</span></div>
      <div class="info-item"><span class="info-label">门店编码</span><span class="info-value">${store?.code || '-'}</span></div>
      <div class="info-item"><span class="info-label">巡检日期</span><span class="info-value">${report.inspectionDate}</span></div>
      <div class="info-item"><span class="info-label">督导</span><span class="info-value">${report.inspector}</span></div>
      <div class="info-item"><span class="info-label">店长</span><span class="info-value">${store?.manager || '-'}</span></div>
      <div class="info-item"><span class="info-label">区域排名</span><span class="rank">第 ${rank} 名</span></div>
    </div>
  </div>

  <div class="section">
    <h2>评分概览</h2>
    <div class="score-box">
      <div class="score-value ${report.totalScore >= 90 ? 'good' : report.totalScore >= 70 ? '' : 'bad'}">${report.totalScore}</div>
      <div class="score-label">综合得分（满分100分）</div>
      <div class="score-breakdown">
        <div class="score-item">
          <div class="num ${report.priceScore >= 90 ? 'good' : report.priceScore >= 70 ? '' : 'bad'}">${report.priceScore}</div>
          <div style="font-size: 12px; color: #666;">价格检查</div>
        </div>
        <div class="score-item">
          <div class="num ${report.promotionScore >= 90 ? 'good' : report.promotionScore >= 70 ? '' : 'bad'}">${report.promotionScore}</div>
          <div style="font-size: 12px; color: #666;">促销核验</div>
        </div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>检查统计</h2>
    <div class="stats">
      <div class="stat-item">
        <div class="stat-num">${report.problemCount}</div>
        <div class="stat-label">发现问题</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">${report.rectificationCount}</div>
        <div class="stat-label">发出整改</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">${100 - report.totalScore}</div>
        <div class="stat-label">累计扣分</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">${storeScores.length}</div>
        <div class="stat-label">区域门店</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>区域排名摘要</h2>
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>门店</th>
          <th>路线</th>
          <th>综合评分</th>
          <th>问题数</th>
        </tr>
      </thead>
      <tbody>
        ${storeScores.slice(0, 5).map((s, i) => `
          <tr style="${s.id === report.storeId ? 'background: #e6f4ff;' : ''}">
            <td>${i + 1}</td>
            <td>${s.name}${s.id === report.storeId ? ' <span style="color:#1677ff;">(当前门店)</span>' : ''}</td>
            <td>${s.route}</td>
            <td style="font-weight: 600; color: ${s.avgScore >= 90 ? '#52c41a' : s.avgScore >= 70 ? '#faad14' : '#ff4d4f'}">${s.avgScore}</td>
            <td>${s.problemCount}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    本报告由智慧零售巡店系统自动生成 · ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.storeName}_巡检报告_${report.inspectionDate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('报告导出成功');
  };

  const handleExportAll = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${user.area} - 区域巡检汇总报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1000px; margin: 0 auto; padding: 40px 20px; color: #333; }
    h1 { text-align: center; color: #1677ff; margin-bottom: 8px; }
    .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
    .section { background: #f5f5f5; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
    .section h2 { margin-top: 0; color: #1f1f1f; font-size: 18px; border-bottom: 2px solid #1677ff; padding-bottom: 8px; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center; }
    .stat-item { padding: 20px; background: #fff; border-radius: 8px; }
    .stat-num { font-size: 32px; font-weight: 700; color: #1677ff; }
    .stat-label { font-size: 13px; color: #666; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e8e8e8; }
    th { background: #fafafa; font-weight: 600; }
    tr:hover { background: #f0f5ff; }
    .rank-badge { display: inline-block; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; background: #e8e8e8; font-weight: 600; font-size: 12px; }
    .rank-1 { background: #faad14; color: #fff; }
    .rank-2 { background: #8c8c8c; color: #fff; }
    .rank-3 { background: #d48806; color: #fff; }
    .score { font-weight: 600; font-size: 16px; }
    .score-good { color: #52c41a; }
    .score-mid { color: #faad14; }
    .score-low { color: #ff4d4f; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e8e8e8; }
  </style>
</head>
<body>
  <h1>区域巡检汇总报告</h1>
  <p class="subtitle">${user.area} · 智慧零售巡店系统 · 生成于 ${new Date().toLocaleString()}</p>

  <div class="section">
    <h2>整体概览</h2>
    <div class="stats">
      <div class="stat-item">
        <div class="stat-num">${storeScores.length}</div>
        <div class="stat-label">门店总数</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" style="color: #52c41a;">${storeScores.filter(s => s.avgScore >= 90).length}</div>
        <div class="stat-label">优秀门店</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" style="color: #faad14;">${Math.round(storeScores.reduce((sum, s) => sum + s.avgScore, 0) / storeScores.length)}</div>
        <div class="stat-label">区域平均分</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" style="color: #ff4d4f;">${storeScores.reduce((sum, s) => sum + s.problemCount, 0)}</div>
        <div class="stat-label">累计问题数</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>门店排名</h2>
    <table>
      <thead>
        <tr>
          <th>排名</th>
          <th>门店名称</th>
          <th>门店编码</th>
          <th>路线</th>
          <th>店长</th>
          <th>综合评分</th>
          <th>巡检次数</th>
          <th>问题数量</th>
          <th>整改项数</th>
        </tr>
      </thead>
      <tbody>
        ${storeScores.map((s, i) => `
          <tr>
            <td><span class="rank-badge ${i < 3 ? 'rank-' + (i + 1) : ''}">${i + 1}</span></td>
            <td style="font-weight: 500;">${s.name}</td>
            <td>${s.code}</td>
            <td>${s.route}</td>
            <td>${s.manager}</td>
            <td><span class="score ${s.avgScore >= 90 ? 'score-good' : s.avgScore >= 70 ? 'score-mid' : 'score-low'}">${s.avgScore}</span></td>
            <td>${s.reportCount}</td>
            <td>${s.problemCount}</td>
            <td>${s.rectCount}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>巡检报告记录</h2>
    <table>
      <thead>
        <tr>
          <th>门店名称</th>
          <th>巡检日期</th>
          <th>督导</th>
          <th>总分</th>
          <th>价格得分</th>
          <th>促销得分</th>
          <th>问题数</th>
          <th>整改数</th>
        </tr>
      </thead>
      <tbody>
        ${reports.map(r => `
          <tr>
            <td>${r.storeName}</td>
            <td>${r.inspectionDate}</td>
            <td>${r.inspector}</td>
            <td style="font-weight: 600; color: ${r.totalScore >= 90 ? '#52c41a' : r.totalScore >= 70 ? '#faad14' : '#ff4d4f'}">${r.totalScore}</td>
            <td>${r.priceScore}</td>
            <td>${r.promotionScore}</td>
            <td>${r.problemCount}</td>
            <td>${r.rectificationCount}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    本报告由智慧零售巡店系统自动生成 · ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${user.area}_区域巡检汇总报告_${dayjs().format('YYYYMMDD')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success('汇总报告导出成功');
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
