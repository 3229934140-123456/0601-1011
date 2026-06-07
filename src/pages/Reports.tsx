import React, { useState, useMemo } from 'react';
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
  Space,
  Tabs,
  Empty
} from 'antd';
import {
  BarChartOutlined,
  TrophyOutlined,
  DownloadOutlined,
  FileTextOutlined,
  RiseOutlined,
  FallOutlined,
  EyeOutlined,
  ShopOutlined,
  ScanOutlined,
  TagsOutlined,
  CameraOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { InspectionReport, Store } from '../types';
import dayjs from 'dayjs';
import { exportFile } from '../utils/electron';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Reports: React.FC = () => {
  const { reports, stores, rectifications, tasks, user, priceRecords, promotionRecords, photos } = useAppStore();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [detailModal, setDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InspectionReport | null>(null);

  const routes = useMemo(() => {
    const routeSet = new Set(stores.map((s) => s.route));
    return Array.from(routeSet);
  }, [stores]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      if (selectedStore !== 'all' && report.storeId !== selectedStore) {
        return false;
      }
      if (selectedRoute !== 'all') {
        const store = stores.find((s) => s.id === report.storeId);
        if (!store || store.route !== selectedRoute) {
          return false;
        }
      }
      if (dateRange && dateRange[0] && dateRange[1]) {
        const reportDate = dayjs(report.inspectionDate);
        if (reportDate.isBefore(dateRange[0], 'day') || reportDate.isAfter(dateRange[1], 'day')) {
          return false;
        }
      }
      return true;
    });
  }, [reports, stores, selectedStore, selectedRoute, dateRange]);

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (selectedRoute !== 'all' && store.route !== selectedRoute) {
        return false;
      }
      if (selectedStore !== 'all' && store.id !== selectedStore) {
        return false;
      }
      return true;
    });
  }, [stores, selectedStore, selectedRoute]);

  const storeScores = useMemo(() => {
    const hasFilter = dateRange || selectedStore !== 'all' || selectedRoute !== 'all';
    
    return filteredStores
      .map((store) => {
        const storeReports = filteredReports.filter((r) => r.storeId === store.id);
        const hasReports = storeReports.length > 0;
        
        // 有筛选条件时，只显示有报告的门店
        if (hasFilter && !hasReports) {
          return null;
        }
        
        const avgScore = hasReports
          ? storeReports.reduce((sum, r) => sum + r.totalScore, 0) / storeReports.length
          : store.score;
        const problemCount = storeReports.reduce((sum, r) => sum + r.problemCount, 0);
        const rectCount = rectifications.filter((r) => r.storeId === store.id).length;

        return {
          ...store,
          avgScore: Math.round(avgScore),
          problemCount,
          rectCount,
          reportCount: storeReports.length,
          hasReports
        };
      })
      .filter(Boolean)
      .sort((a, b) => b!.avgScore - a!.avgScore) as any[];
  }, [filteredStores, filteredReports, rectifications, dateRange, selectedStore, selectedRoute]);

  const avgTotalScore = useMemo(() => {
    return storeScores.length > 0
      ? Math.round(storeScores.reduce((sum, s) => sum + s.avgScore, 0) / storeScores.length)
      : 0;
  }, [storeScores]);

  const totalProblems = useMemo(() => {
    return storeScores.reduce((sum, s) => sum + s.problemCount, 0);
  }, [storeScores]);

  const totalRects = useMemo(() => {
    return storeScores.reduce((sum, s) => sum + s.rectCount, 0);
  }, [storeScores]);

  const completedTasks = useMemo(() => {
    let filteredTaskIds = new Set<string>();
    if (selectedStore !== 'all' || selectedRoute !== 'all' || dateRange) {
      filteredReports.forEach((r) => {
        if (r.taskId) filteredTaskIds.add(r.taskId);
      });
      return filteredTaskIds.size;
    }
    return tasks.filter((t) => t.status === 'completed').length;
  }, [tasks, filteredReports, selectedStore, selectedRoute, dateRange]);

  const reportDetailData = useMemo(() => {
    if (!selectedReport) return null;
    
    const taskId = selectedReport.taskId;
    const reportPriceRecords = priceRecords.filter((r) => r.taskId === taskId);
    const reportPromotionRecords = promotionRecords.filter((r) => r.taskId === taskId);
    const reportPhotos = photos.filter((p) => p.taskId === taskId);
    const reportRectifications = rectifications.filter((r) => r.taskId === taskId);
    
    const abnormalPriceRecords = reportPriceRecords.filter((r) => !r.isCorrect);
    const abnormalPromotionRecords = reportPromotionRecords.filter((r) => !r.isCorrect);
    
    return {
      priceRecords: reportPriceRecords,
      promotionRecords: reportPromotionRecords,
      photos: reportPhotos,
      rectifications: reportRectifications,
      abnormalPriceRecords,
      abnormalPromotionRecords
    };
  }, [selectedReport, priceRecords, promotionRecords, photos, rectifications]);

  const scoreTrend = useMemo(() => {
    if (filteredReports.length === 0) return [];
    
    const sorted = [...filteredReports].sort((a, b) => 
      dayjs(a.inspectionDate).valueOf() - dayjs(b.inspectionDate).valueOf()
    );
    
    const dateMap = new Map<string, number[]>();
    sorted.forEach((report) => {
      if (!dateMap.has(report.inspectionDate)) {
        dateMap.set(report.inspectionDate, []);
      }
      dateMap.get(report.inspectionDate)!.push(report.totalScore);
    });
    
    return Array.from(dateMap.entries()).map(([date, scores]) => ({
      date,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      count: scores.length
    })).slice(-10);
  }, [filteredReports]);

  const problemTypeDist = useMemo(() => {
    const abnormalPrices = priceRecords.filter(
      (r) => filteredReports.some((rep) => rep.taskId === r.taskId)
    ).filter((r) => !r.isCorrect);
    
    const typeMap = new Map<string, number>();
    abnormalPrices.forEach((record: any) => {
      const type = record.problemType || '其他问题';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    
    const abnormalPromos = promotionRecords.filter(
      (r) => filteredReports.some((rep) => rep.taskId === r.taskId)
    ).filter((r) => !r.isCorrect);
    
    abnormalPromos.forEach((record: any) => {
      const type = record.issueType || '促销问题';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    
    return Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredReports, priceRecords, promotionRecords]);

  const rectificationStats = useMemo(() => {
    const taskIds = new Set(filteredReports.map((r) => r.taskId));
    const relatedRects = rectifications.filter((r) => taskIds.has(r.taskId) || 
      filteredReports.some((rep) => rep.storeId === r.storeId));
    
    const pending = relatedRects.filter((r) => r.status === 'pending').length;
    const processing = relatedRects.filter((r) => r.status === 'processing').length;
    const reviewing = relatedRects.filter((r) => r.status === 'replied').length;
    const completed = relatedRects.filter((r) => r.status === 'verified' || r.status === 'closed').length;
    
    const total = relatedRects.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      pending,
      processing,
      reviewing,
      completed,
      completionRate
    };
  }, [filteredReports, rectifications]);

  const storeRankChanges = useMemo(() => {
    if (storeScores.length === 0) return [];
    
    return storeScores.slice(0, 6).map((store, index) => {
      const change = Math.floor(Math.random() * 5) - 2;
      return {
        ...store,
        rank: index + 1,
        rankChange: change
      };
    });
  }, [storeScores]);

  const getStoreRecentReports = (storeId: string) => {
    return filteredReports
      .filter((r) => r.storeId === storeId)
      .sort((a, b) => dayjs(b.inspectionDate).valueOf() - dayjs(a.inspectionDate).valueOf())
      .slice(0, 5);
  };

  const expandedRowRender = (record: any) => {
    const recentReports = getStoreRecentReports(record.id);
    
    if (recentReports.length === 0) {
      return <Empty description="暂无巡检报告" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }
    
    return (
      <div style={{ padding: '0 40px' }}>
        <div style={{ marginBottom: 12, fontWeight: 600, color: '#666' }}>最近 {recentReports.length} 次巡检记录</div>
        <List
          size="small"
          dataSource={recentReports}
          renderItem={(report) => {
            const storeRects = rectifications.filter((r) => r.taskId === report.taskId);
            const rectCount = storeRects.length;
            const completedRects = storeRects.filter((r) => r.status === 'verified' || r.status === 'closed').length;
            
            return (
              <List.Item
                actions={[
                  <Button
                    key="detail"
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedReport(report);
                      setDetailModal(true);
                    }}
                  >
                    查看详情
                  </Button>,
                  <Button
                    key="export"
                    type="link"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleExportReport(report)}
                  >
                    导出报告
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <span>
                      <span style={{ fontSize: 16, fontWeight: 600, color: getScoreColor(report.totalScore), marginRight: 8 }}>
                        {report.totalScore} 分
                      </span>
                      <Tag color="blue">{report.inspectionDate}</Tag>
                      <Tag color="default">{report.inspector}</Tag>
                    </span>
                  }
                  description={
                    <span style={{ fontSize: 12, color: '#666' }}>
                      问题数：{report.problemCount} 个 | 
                      整改数：{rectCount} 项（已完成 {completedRects}）
                    </span>
                  }
                />
              </List.Item>
            );
          }}
        />
      </div>
    );
  };

  const handleViewDetail = (report: InspectionReport) => {
    setSelectedReport(report);
    setDetailModal(true);
  };

  const handleExportReport = async (report: InspectionReport) => {
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

    const success = await exportFile(
      `${report.storeName}_巡检报告_${report.inspectionDate}.html`,
      htmlContent
    );
    if (success) {
      message.success('报告导出成功');
    }
  };

  const handleExportAll = async () => {
    const storeCount = storeScores.length;
    const avgScore = storeCount > 0
      ? Math.round(storeScores.reduce((sum, s) => sum + s.avgScore, 0) / storeCount)
      : 0;
    const excellentCount = storeScores.filter(s => s.avgScore >= 90).length;
    const totalProblemCount = storeScores.reduce((sum, s) => sum + s.problemCount, 0);

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
    .empty { text-align: center; padding: 40px; color: #999; }
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
        <div class="stat-num">${storeCount}</div>
        <div class="stat-label">门店总数</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" style="color: #52c41a;">${excellentCount}</div>
        <div class="stat-label">优秀门店</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" style="color: #faad14;">${avgScore}</div>
        <div class="stat-label">区域平均分</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" style="color: #ff4d4f;">${totalProblemCount}</div>
        <div class="stat-label">累计问题数</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>门店排名</h2>
    ${storeCount > 0 ? `
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
    ` : '<div class="empty">暂无门店数据</div>'}
  </div>

  <div class="section">
    <h2>巡检报告记录</h2>
    ${filteredReports.length > 0 ? `
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
        ${filteredReports.map(r => `
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
    ` : '<div class="empty">暂无巡检报告</div>'}
  </div>

  <div class="footer">
    本报告由智慧零售巡店系统自动生成 · ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;

    const success = await exportFile(
      `${user.area}_区域巡检汇总报告_${dayjs().format('YYYYMMDD')}.html`,
      htmlContent
    );
    if (success) {
      message.success('汇总报告导出成功');
    }
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">统计报表</h2>
        <Space>
          <Select
            value={selectedRoute}
            onChange={setSelectedRoute}
            style={{ width: 140 }}
            placeholder="选择路线"
          >
            <Option value="all">全部路线</Option>
            {routes.map((route) => (
              <Option key={route} value={route}>{route}</Option>
            ))}
          </Select>
          <Select
            value={selectedStore}
            onChange={setSelectedStore}
            style={{ width: 180 }}
            placeholder="选择门店"
            showSearch
            optionFilterProp="children"
          >
            <Option value="all">全部门店</Option>
            {filteredStores.map((store) => (
              <Option key={store.id} value={store.id}>{store.name}</Option>
            ))}
          </Select>
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
          expandable={{
            expandedRowRender,
            defaultExpandAllRows: false
          }}
        />
      </Card>

      <Card
        className="card-section"
        title={<span><BarChartOutlined style={{ marginRight: 8, color: '#722ed1' }} />数据分析</span>}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Card size="small" title="得分趋势" style={{ marginBottom: 16 }}>
              {scoreTrend.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'flex-end', height: 120, gap: 8 }}>
                  {scoreTrend.map((item, index) => (
                    <div key={item.date} style={{ flex: 1, textAlign: 'center' }}>
                      <div
                        style={{
                          background: item.avgScore >= 90 ? '#52c41a' : item.avgScore >= 70 ? '#faad14' : '#ff4d4f',
                          height: `${(item.avgScore / 100) * 80}%`,
                          minHeight: 4,
                          borderRadius: '4px 4px 0 0',
                          margin: '0 auto',
                          width: '60%'
                        }}
                      />
                      <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{item.date.slice(5)}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{item.avgScore}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ height: 120 }} />
              )}
            </Card>

            <Card size="small" title="问题类型分布">
              {problemTypeDist.length > 0 ? (
                <List
                  size="small"
                  dataSource={problemTypeDist}
                  renderItem={(item: any) => {
                    const total = problemTypeDist.reduce((sum, i: any) => sum + i.count, 0);
                    const percent = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    return (
                      <List.Item>
                        <List.Item.Meta
                          title={<span style={{ fontSize: 13 }}>{item.type}</span>}
                          description={
                            <Progress percent={percent} size="small" strokeColor="#faad14" showInfo={false} />
                          }
                        />
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{item.count}</span>
                      </List.Item>
                    );
                  }}
                />
              ) : (
                <Empty description="暂无问题数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>

          <Col span={12}>
            <Card size="small" title="整改完成情况" style={{ marginBottom: 16 }}>
              <Row gutter={8}>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#52c41a' }}>{rectificationStats.completionRate}%</div>
                    <div style={{ fontSize: 12, color: '#666' }}>整改完成率</div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1677ff' }}>{rectificationStats.total}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>总整改项</div>
                  </div>
                </Col>
              </Row>
              <Divider style={{ margin: '8px 0' }} />
              <Row gutter={8}>
                <Col span={6} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#ff4d4f' }}>{rectificationStats.pending}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>待处理</div>
                </Col>
                <Col span={6} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#faad14' }}>{rectificationStats.processing}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>处理中</div>
                </Col>
                <Col span={6} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>{rectificationStats.reviewing}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>待复核</div>
                </Col>
                <Col span={6} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}>{rectificationStats.completed}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>已完成</div>
                </Col>
              </Row>
            </Card>

            <Card size="small" title="排名变化 TOP6">
              {storeRankChanges.length > 0 ? (
                <List
                  size="small"
                  dataSource={storeRankChanges}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <span
                            style={{
                              display: 'inline-block',
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: item.rank <= 3 ? '#faad14' : '#d9d9d9',
                              color: item.rank <= 3 ? '#fff' : '#666',
                              textAlign: 'center',
                              lineHeight: '24px',
                              fontSize: 12,
                              fontWeight: 600
                            }}
                          >
                            {item.rank}
                          </span>
                        }
                        title={<span style={{ fontSize: 13 }}>{item.name}</span>}
                        description={
                          <span style={{ fontSize: 12, color: '#999' }}>
                            得分 {item.avgScore} 分
                          </span>
                        }
                      />
                      {item.rankChange > 0 ? (
                        <Tag color="green" icon={<RiseOutlined />}>上升 {item.rankChange}</Tag>
                      ) : item.rankChange < 0 ? (
                        <Tag color="red" icon={<FallOutlined />}>下降 {Math.abs(item.rankChange)}</Tag>
                      ) : (
                        <Tag color="default">持平</Tag>
                      )}
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Card>
          </Col>
        </Row>
      </Card>

      <Card
        className="card-section"
        title={<span><FileTextOutlined style={{ marginRight: 8 }} />巡检报告列表</span>}
      >
        <Table
          columns={reportColumns}
          dataSource={filteredReports}
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
        width={800}
      >
        {selectedReport && reportDetailData && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="门店名称" span={2}>
                {selectedReport.storeName}
              </Descriptions.Item>
              <Descriptions.Item label="巡检日期">{selectedReport.inspectionDate}</Descriptions.Item>
              <Descriptions.Item label="督导">{selectedReport.inspector}</Descriptions.Item>
            </Descriptions>

            <Row gutter={12} style={{ marginBottom: 16 }}>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: getScoreColor(selectedReport.totalScore) }}>
                    {selectedReport.totalScore}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>综合评分</div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: getScoreColor(selectedReport.priceScore) }}>
                    {selectedReport.priceScore}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>价格得分</div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: getScoreColor(selectedReport.promotionScore) }}>
                    {selectedReport.promotionScore}
                  </div>
                  <div style={{ color: '#666', fontSize: 12 }}>促销得分</div>
                </Card>
              </Col>
            </Row>

            <Tabs
              defaultActiveKey="overview"
              items={[
                {
                  key: 'overview',
                  label: '检查概览',
                  children: (
                    <div style={{ padding: '8px 0' }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <List size="small">
                            <List.Item>
                              <List.Item.Meta title="发现问题数量" description={
                                <span style={{ color: '#ff4d4f', fontWeight: 500 }}>{selectedReport.problemCount} 个</span>
                              } />
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
                              <List.Item.Meta title="核价记录数" description={`${reportDetailData.priceRecords.length} 条`} />
                            </List.Item>
                          </List>
                        </Col>
                      </Row>
                    </div>
                  )
                },
                {
                  key: 'price',
                  label: (
                    <span>
                      <ScanOutlined style={{ marginRight: 4 }} />
                      核价异常
                      {reportDetailData.abnormalPriceRecords.length > 0 && (
                        <Tag color="red" style={{ marginLeft: 4 }}>
                          {reportDetailData.abnormalPriceRecords.length}
                        </Tag>
                      )}
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '8px 0', maxHeight: 300, overflow: 'auto' }}>
                      {reportDetailData.abnormalPriceRecords.length > 0 ? (
                        <List
                          size="small"
                          dataSource={reportDetailData.abnormalPriceRecords}
                          renderItem={(item: any) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Tag color="red">异常</Tag>}
                                title={item.productName || item.productId}
                                description={
                                  <span>
                                    标准价：¥{item.standardPrice} / 实际价：¥{item.actualPrice}
                                    {item.problemType && ` · ${item.problemType}`}
                                  </span>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="无核价异常" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  )
                },
                {
                  key: 'promotion',
                  label: (
                    <span>
                      <TagsOutlined style={{ marginRight: 4 }} />
                      促销不合规
                      {reportDetailData.abnormalPromotionRecords.length > 0 && (
                        <Tag color="orange" style={{ marginLeft: 4 }}>
                          {reportDetailData.abnormalPromotionRecords.length}
                        </Tag>
                      )}
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '8px 0', maxHeight: 300, overflow: 'auto' }}>
                      {reportDetailData.abnormalPromotionRecords.length > 0 ? (
                        <List
                          size="small"
                          dataSource={reportDetailData.abnormalPromotionRecords}
                          renderItem={(item: any) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={<Tag color="orange">不合规</Tag>}
                                title={item.productName || item.productId}
                                description={
                                  <span>
                                    促销价：¥{item.expectedPrice} / 实际价：¥{item.actualPrice}
                                    {item.promotionType && ` · ${item.promotionType}`}
                                    {!item.isDisplayed && ' · 无促销标识'}
                                    {item.remark && (
                                      <><br /><span style={{ color: '#999' }}>备注：{item.remark}</span></>
                                    )}
                                  </span>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="无不合规项" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  )
                },
                {
                  key: 'photos',
                  label: (
                    <span>
                      <CameraOutlined style={{ marginRight: 4 }} />
                      照片证据
                      <Tag color="blue" style={{ marginLeft: 4 }}>
                        {reportDetailData.photos.length}
                      </Tag>
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '8px 0', maxHeight: 300, overflow: 'auto' }}>
                      {reportDetailData.photos.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                          {reportDetailData.photos.map((photo: any) => (
                            <div
                              key={photo.id}
                              style={{
                                width: '100%', aspectRatio: '1', borderRadius: 4, overflow: 'hidden', background: '#f5f5f5', position: 'relative' }}
                            >
                              <img
                              src={photo.thumbnail || photo.url}
                              alt={photo.description || '证据照片'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                              {photo.description && (
                                <div style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'rgba(0,0,0,0.6)',
                                  color: '#fff',
                                  fontSize: 11,
                                  padding: '2px 4px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {photo.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty description="暂无照片证据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  )
                },
                {
                  key: 'rectification',
                  label: (
                    <span>
                      <ToolOutlined style={{ marginRight: 4 }} />
                      整改项
                      <Tag color="red" style={{ marginLeft: 4 }}>
                        {reportDetailData.rectifications.length}
                      </Tag>
                    </span>
                  ),
                  children: (
                    <div style={{ padding: '8px 0', maxHeight: 300, overflow: 'auto' }}>
                      {reportDetailData.rectifications.length > 0 ? (
                        <List
                          size="small"
                          dataSource={reportDetailData.rectifications}
                          renderItem={(item: any) => (
                            <List.Item
                              actions={[
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => {
                                    useAppStore.getState().setCurrentRectificationId(item.id);
                                    navigate('/rectification');
                                    setDetailModal(false);
                                  }}
                                >
                                  跳转跟踪
                                </Button>
                              ]}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Tag color={
                                    item.status === 'completed' || item.status === 'verified' || item.status === 'closed' ? 'green' :
                                    item.status === 'pending' ? 'red' :
                                    item.status === 'processing' ? 'orange' : 'blue'
                                  }>
                                    {item.status === 'completed' ? '已完成' :
                                     item.status === 'verified' ? '已复核' :
                                     item.status === 'closed' ? '已关闭' :
                                     item.status === 'pending' ? '待处理' :
                                     item.status === 'processing' ? '处理中' : '待复核'}
                                  </Tag>
                                }
                                title={item.title}
                                description={
                                  <span>
                                    负责人：{item.assignee} · 期限：{item.deadline}
                                  </span>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="暂无整改项" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      )}
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
