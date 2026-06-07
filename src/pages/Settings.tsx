import React, { useState, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Button,
  Switch,
  Select,
  message,
  Divider,
  List,
  Tag,
  Progress,
  Space,
  Alert,
  Modal,
  Upload,
  Tabs,
  Empty
} from 'antd';
import {
  SettingOutlined,
  SyncOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  UserOutlined,
  BellOutlined,
  WifiOutlined,
  DisconnectOutlined,
  FileTextOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { mockProducts } from '../data/mockData';

const { Option } = Select;

const Settings: React.FC = () => {
  const { user, products, setOffline, isOffline, syncProducts, pendingSyncIds, syncAllData, getPendingSyncCount, getSyncStatus, getPendingSyncDetails, resetAllData, priceRecords, promotionRecords, photos, rectifications, lastSyncTime, syncLogs } = useAppStore();
  const [form] = Form.useForm();
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [dataSyncing, setDataSyncing] = useState(false);
  const [pendingDetailVisible, setPendingDetailVisible] = useState(false);
  const [syncLogVisible, setSyncLogVisible] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);
  const [clearDataModal, setClearDataModal] = useState(false);

  const pendingCount = useMemo(() => getPendingSyncCount(), [pendingSyncIds]);

  const pendingBreakdown = useMemo(() => [
    { label: '核价记录', count: pendingSyncIds.priceRecords.length },
    { label: '促销核验', count: pendingSyncIds.promotionRecords.length },
    { label: '照片证据', count: pendingSyncIds.photos.length },
    { label: '整改记录', count: pendingSyncIds.rectifications.length }
  ], [pendingSyncIds]);

  const syncStatus = useMemo(() => getSyncStatus(), [pendingSyncIds, priceRecords, promotionRecords, photos, rectifications]);

  const pendingDetails = useMemo(() => getPendingSyncDetails(), [pendingSyncIds, priceRecords, promotionRecords, photos, rectifications]);

  const formattedLastSyncTime = useMemo(() => {
    if (!lastSyncTime) return '从未同步';
    const date = new Date(lastSyncTime);
    return date.toLocaleString('zh-CN');
  }, [lastSyncTime]);

  const handleSyncAllData = async () => {
    if (isOffline) {
      message.warning('当前处于离线模式，请先切换到在线模式');
      return;
    }
    if (pendingCount === 0) {
      message.info('没有待同步的数据');
      return;
    }
    setDataSyncing(true);
    const success = await syncAllData();
    setDataSyncing(false);
    if (success) {
      message.success(`数据同步成功，共同步 ${pendingCount} 条记录`);
    } else {
      message.error('数据同步失败，请检查网络连接');
    }
  };

  const handleSyncProducts = () => {
    setSyncing(true);
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncing(false);
          syncProducts(mockProducts);
          message.success('商品清单同步成功');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleSaveSettings = () => {
    message.success('设置已保存');
  };

  const handleToggleOffline = (checked: boolean) => {
    setOffline(checked);
    message.info(checked ? '已切换到离线模式' : '已切换到在线模式');
  };

  const storageInfo = useMemo(() => {
    const priceRecordCount = priceRecords.length;
    const promotionRecordCount = promotionRecords.length;
    const photoCount = photos.length;
    const rectCount = rectifications.length;
    const totalRecords = priceRecordCount + promotionRecordCount + photoCount + rectCount;
    const approxKB = totalRecords * 2 + photoCount * 50;
    const approxMB = (approxKB / 1024).toFixed(1);
    const percent = Math.min((approxKB / (100 * 1024)) * 100, 100);

    return {
      total: '100 MB',
      used: `${approxMB} MB`,
      percent,
      photoCount,
      priceRecordCount,
      promotionRecordCount,
      rectCount,
      totalRecords
    };
  }, [priceRecords, promotionRecords, photos, rectifications]);

  const handleClearData = () => {
    resetAllData();
    setClearDataModal(false);
    message.success('离线数据已清除');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">设置</h2>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card className="card-section" title={<span><UserOutlined style={{ marginRight: 8 }} />个人信息</span>}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={user.avatar}
                  alt="avatar"
                  style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #e6f4ff' }}
                />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 20 }}>{user.name}</h3>
                <p style={{ margin: '4px 0', color: '#666' }}>{user.area} · 区域督导</p>
                <Tag color="blue">{user.role === 'inspector' ? '督导' : user.role}</Tag>
              </div>
            </div>
            <Divider />
            <Form layout="vertical" initialValues={{ name: user.name, area: user.area }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="姓名" name="name">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="所属区域" name="area">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="联系电话" name="phone">
                    <Input placeholder="请输入联系电话" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="工号" name="employeeId">
                    <Input placeholder="请输入工号" disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card className="card-section" title={<span><SyncOutlined style={{ marginRight: 8 }} />数据同步</span>}>
            {isOffline && (
              <Alert
                message="当前处于离线模式"
                description="新增数据将暂存本地，联网后点击同步按钮上传"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {pendingCount > 0 && (
              <Alert
                message={`有 ${pendingCount} 条数据待同步`}
                description="建议在联网状态下点击下方按钮进行同步"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {isOffline ? <DisconnectOutlined style={{ color: '#ff4d4f', fontSize: 20 }} /> : <WifiOutlined style={{ color: '#52c41a', fontSize: 20 }} />}
                <div>
                  <div style={{ fontWeight: 500 }}>离线模式</div>
                  <div style={{ fontSize: 12, color: '#999' }}>开启后数据暂存本地，联网后手动同步</div>
                </div>
              </div>
              <Switch checked={isOffline} onChange={handleToggleOffline} />
            </div>

            <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 500 }}>同步状态</span>
                <span style={{ fontSize: 12, color: '#999' }}>最后同步：{formattedLastSyncTime}</span>
              </div>
              <List
                size="small"
                dataSource={syncStatus}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <List.Item.Meta
                      title={
                        <span style={{ fontSize: 13 }}>
                          {item.type}
                          <Tag
                            color={item.status === 'synced' ? 'green' : 'orange'}
                            style={{ marginLeft: 8 }}
                          >
                            {item.status === 'synced' ? '已同步' : `${item.pending} 条待同步`}
                          </Tag>
                        </span>
                      }
                      description={<span style={{ fontSize: 12, color: '#999' }}>共 {item.total} 条</span>}
                    />
                    <Progress
                      percent={item.total > 0 ? Math.round(((item.total - item.pending) / item.total) * 100) : 100}
                      size="small"
                      showInfo={false}
                      style={{ width: 100 }}
                      strokeColor={item.status === 'synced' ? '#52c41a' : '#faad14'}
                    />
                  </List.Item>
                )}
              />
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={handleSyncAllData}
                loading={dataSyncing}
                disabled={isOffline || pendingCount === 0}
                block
                style={{ marginTop: 12 }}
              >
                {pendingCount > 0 ? `同步所有数据（${pendingCount}条待同步）` : '数据已全部同步'}
              </Button>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button
                  size="small"
                  type="link"
                  onClick={() => setPendingDetailVisible(true)}
                  disabled={pendingCount === 0}
                  style={{ flex: 1 }}
                >
                  查看待同步明细
                </Button>
                <Button
                  size="small"
                  type="link"
                  onClick={() => setSyncLogVisible(true)}
                  style={{ flex: 1 }}
                >
                  同步日志 ({syncLogs.length})
                </Button>
              </div>
            </div>

            <div style={{ padding: '16px 0' }}>
              <div style={{ fontWeight: 500, marginBottom: 12 }}>基础数据同步</div>
              <List
                size="small"
                dataSource={[
                  {
                    title: '商品清单',
                    desc: `当前版本：2024-01-15 · 共 ${products.length} 个商品`,
                    action: (
                      <Button
                        icon={<CloudDownloadOutlined />}
                        onClick={handleSyncProducts}
                        loading={syncing}
                        size="small"
                      >
                        同步
                      </Button>
                    )
                  },
                  {
                    title: '门店基础数据',
                    desc: '上次同步：2024-01-20 10:30',
                    action: <Button icon={<CloudDownloadOutlined />} size="small">同步</Button>
                  }
                ]}
                renderItem={(item) => (
                  <List.Item actions={[item.action]}>
                    <List.Item.Meta
                      title={<span style={{ fontSize: 13 }}>{item.title}</span>}
                      description={<span style={{ fontSize: 12, color: '#999' }}>{item.desc}</span>}
                    />
                  </List.Item>
                )}
              />
            </div>

            {syncing && (
              <div style={{ marginTop: 16 }}>
                <Progress percent={syncProgress} size="small" />
                <p style={{ textAlign: 'center', color: '#666', marginTop: 8, fontSize: 12 }}>
                  正在同步商品清单... {syncProgress}%
                </p>
              </div>
            )}
          </Card>

          <Card className="card-section" title={<span><BellOutlined style={{ marginRight: 8 }} />通知设置</span>}>
            <List
              size="large"
              dataSource={[
                { title: '新任务提醒', desc: '有新的巡店任务时推送通知', checked: true },
                { title: '整改到期提醒', desc: '整改期限临近时推送提醒', checked: true },
                { title: '门店回复提醒', desc: '门店回复整改后推送通知', checked: true },
                { title: '数据同步提醒', desc: '数据同步完成后推送通知', checked: false },
                { title: '声音提醒', desc: '通知时播放提示音', checked: false }
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[<Switch defaultChecked={item.checked} />]}
                  style={{ padding: '12px 0' }}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={<span style={{ color: '#999' }}>{item.desc}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card className="card-section" title={<span><DatabaseOutlined style={{ marginRight: 8 }} />存储管理</span>}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span>已用空间</span>
                <span>{storageInfo.used} / {storageInfo.total}</span>
              </div>
              <Progress percent={storageInfo.percent} size="small" strokeColor="#1677ff" />
            </div>

            <List
              size="small"
              dataSource={[
                { label: '核价记录', size: '≈ ' + (storageInfo.priceRecordCount * 0.002).toFixed(2) + ' KB', count: storageInfo.priceRecordCount },
                { label: '促销核验', size: '≈ ' + (storageInfo.promotionRecordCount * 0.002).toFixed(2) + ' KB', count: storageInfo.promotionRecordCount },
                { label: '照片数据', size: '≈ ' + (storageInfo.photoCount * 0.05).toFixed(1) + ' MB', count: storageInfo.photoCount },
                { label: '整改记录', size: '≈ ' + (storageInfo.rectCount * 0.003).toFixed(2) + ' KB', count: storageInfo.rectCount },
                { label: '商品数据', size: '≈ 0.1 MB', count: products.length }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <span>{item.label}</span>
                  <span style={{ color: '#666' }}>{item.size} · {item.count} 项</span>
                </List.Item>
              )}
            />

            <Divider />

            <Space>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => setClearDataModal(true)}
              >
                清除离线数据
              </Button>
              <Button
                icon={<CloudUploadOutlined />}
                onClick={handleSyncAllData}
                disabled={isOffline || pendingCount === 0}
                loading={dataSyncing}
              >
                上传所有数据
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={8}>
          <Card className="card-section" size="small">
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <h3 style={{ marginBottom: 8 }}>智慧零售巡店系统</h3>
              <p style={{ color: '#999', marginBottom: 16 }}>v1.0.0</p>
              <Button type="link" onClick={() => setAboutModal(true)}>
                关于应用
              </Button>
            </div>
          </Card>

          <Card className="card-section" title="快捷操作" size="small">
            <List
              size="small"
              dataSource={[
                { icon: <SyncOutlined />, label: '立即同步数据', action: handleSyncProducts },
                { icon: <FileTextOutlined />, label: '导出巡检记录' },
                { icon: <CloudUploadOutlined />, label: '上传待同步数据' }
              ]}
              renderItem={(item) => (
                <List.Item
                  style={{ cursor: 'pointer' }}
                  onClick={item.action}
                >
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.label}
                  />
                  <span style={{ color: '#999' }}>{'>'}</span>
                </List.Item>
              )}
            />
          </Card>

          <Card className="card-section" title="帮助与支持" size="small">
            <List
              size="small"
              dataSource={[
                { label: '使用手册' },
                { label: '常见问题' },
                { label: '意见反馈' },
                { label: '联系客服' }
              ]}
              renderItem={(item) => (
                <List.Item style={{ cursor: 'pointer' }}>
                  <List.Item.Meta title={item.label} />
                  <span style={{ color: '#999' }}>{'>'}</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ position: 'fixed', bottom: 24, right: 24 }}>
        <Button type="primary" size="large" onClick={handleSaveSettings}>
          保存设置
        </Button>
      </div>

      <Modal
        title="关于智慧零售巡店系统"
        open={aboutModal}
        onCancel={() => setAboutModal(false)}
        footer={[
          <Button key="close" onClick={() => setAboutModal(false)}>
            关闭
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <h2 style={{ marginBottom: 8 }}>智慧零售巡店系统</h2>
          <p style={{ color: '#666' }}>版本 1.0.0 (Build 20240120)</p>
          <Divider />
          <p style={{ color: '#666', lineHeight: 1.8 }}>
            智慧零售巡店系统是一款专为区域督导设计的门店巡检工具，
            支持商品核价、促销核验、拍照取证、整改跟踪等功能，
            帮助督导高效完成门店巡检工作。
          </p>
          <p style={{ color: '#999', fontSize: 12, marginTop: 16 }}>
            © 2024 智慧零售科技有限公司 版权所有
          </p>
        </div>
      </Modal>

      <Modal
        title="清除离线数据"
        open={clearDataModal}
        onOk={handleClearData}
        onCancel={() => setClearDataModal(false)}
        okText="确认清除"
        okType="danger"
        cancelText="取消"
      >
        <Alert
          message="确定要清除所有离线数据吗？"
          description="此操作将删除所有本地暂存的巡检数据、照片和记录，请确保已同步上传到服务器。"
          type="warning"
          showIcon
        />
      </Modal>

      <Modal
        title="待同步数据明细"
        open={pendingDetailVisible}
        onCancel={() => setPendingDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPendingDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
      >
        <Tabs
          defaultActiveKey="price"
          items={[
            {
              key: 'price',
              label: (
                <span>
                  核价记录
                  <Tag color="red" style={{ marginLeft: 6 }}>
                    {pendingDetails.priceRecords.length}
                  </Tag>
                </span>
              ),
              children: pendingDetails.priceRecords.length > 0 ? (
                <List
                  size="small"
                  dataSource={pendingDetails.priceRecords}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.productName || item.productId}
                        description={
                          <span>
                            标准价：¥{item.standardPrice} · 实际价：¥{item.actualPrice}
                            {item.isCorrect ? (
                              <Tag color="green" style={{ marginLeft: 8 }}>正常</Tag>
                            ) : (
                              <Tag color="red" style={{ marginLeft: 8 }}>异常</Tag>
                            )}
                          </span>
                        }
                      />
                      <span style={{ fontSize: 12, color: '#999' }}>{item.checkTime}</span>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无待同步数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )
            },
            {
              key: 'promotion',
              label: (
                <span>
                  促销核验
                  <Tag color="orange" style={{ marginLeft: 6 }}>
                    {pendingDetails.promotionRecords.length}
                  </Tag>
                </span>
              ),
              children: pendingDetails.promotionRecords.length > 0 ? (
                <List
                  size="small"
                  dataSource={pendingDetails.promotionRecords}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.productName || item.productId}
                        description={
                          <span>
                            促销价：¥{item.promotionPrice} · 实际价：¥{item.actualPrice}
                            {item.isCorrect ? (
                              <Tag color="green" style={{ marginLeft: 8 }}>合规</Tag>
                            ) : (
                              <Tag color="orange" style={{ marginLeft: 8 }}>不合规</Tag>
                            )}
                          </span>
                        }
                      />
                      <span style={{ fontSize: 12, color: '#999' }}>{item.checkTime}</span>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无待同步数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )
            },
            {
              key: 'photos',
              label: (
                <span>
                  照片证据
                  <Tag color="blue" style={{ marginLeft: 6 }}>
                    {pendingDetails.photos.length}
                  </Tag>
                </span>
              ),
              children: pendingDetails.photos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {pendingDetails.photos.map((photo: any) => (
                    <div
                      key={photo.id}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: 4, overflow: 'hidden',
                        background: '#f5f5f5', position: 'relative'
                      }}
                    >
                      <img
                        src={photo.thumbnail || photo.url}
                        alt={photo.description || '证据照片'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {photo.description && (
                        <div style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0,
                          background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 11,
                          padding: '2px 4px', overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {photo.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="暂无待同步数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )
            },
            {
              key: 'rectification',
              label: (
                <span>
                  整改项
                  <Tag color="warning" style={{ marginLeft: 6 }}>
                    {pendingDetails.rectifications.length}
                  </Tag>
                </span>
              ),
              children: pendingDetails.rectifications.length > 0 ? (
                <List
                  size="small"
                  dataSource={pendingDetails.rectifications}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.title}
                        description={
                          <span>
                            负责人：{item.responsiblePerson} · 期限：{item.deadline}
                            <Tag
                              color={
                                item.status === 'completed' ? 'green' :
                                item.status === 'pending' ? 'red' :
                                item.status === 'processing' ? 'orange' : 'blue'
                              }
                              style={{ marginLeft: 8 }}
                            >
                              {item.status === 'completed' ? '已完成' :
                               item.status === 'pending' ? '待处理' :
                               item.status === 'processing' ? '处理中' : '待复核'}
                            </Tag>
                          </span>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无待同步数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )
            }
          ]}
        />
      </Modal>

      <Modal
        title="同步日志"
        open={syncLogVisible}
        onCancel={() => setSyncLogVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSyncLogVisible(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {syncLogs.length > 0 ? (
          <List
            size="small"
            dataSource={syncLogs}
            renderItem={(log: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    log.result === 'success'
                      ? <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                      : <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                  }
                  title={
                    <span>
                      同步{log.result === 'success' ? '成功' : '失败'}
                      <Tag color="blue" style={{ marginLeft: 8 }}>
                        {log.totalCount} 条数据
                      </Tag>
                    </span>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>
                        {new Date(log.syncTime).toLocaleString('zh-CN')}
                      </div>
                      <div style={{ fontSize: 12 }}>
                        {log.details.map((d: any) => (
                          <Tag key={d.type} color="default" style={{ marginRight: 4 }}>
                            {d.type}: {d.count}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无同步记录" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Modal>
    </div>
  );
};

export default Settings;
