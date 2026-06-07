import React, { useState } from 'react';
import { Card, Row, Col, Input, Select, Tag, Button, List, Avatar, Modal, Descriptions } from 'antd';
import { SearchOutlined, ShopOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useAppStore } from '../store/appStore';
import { Store } from '../types';
import { routes } from '../data/mockData';

const { Option } = Select;

const StoreList: React.FC = () => {
  const { stores, setCurrentStore } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [detailModal, setDetailModal] = useState(false);
  const [currentStore, setCurrentStoreState] = useState<Store | null>(null);

  const filteredStores = stores.filter((store) => {
    const matchSearch =
      !searchText ||
      store.name.includes(searchText) ||
      store.code.includes(searchText) ||
      store.address.includes(searchText);
    const matchRoute = !selectedRoute || store.route === selectedRoute;
    const matchStatus = !selectedStatus || store.status === selectedStatus;
    return matchSearch && matchRoute && matchStatus;
  });

  const handleViewDetail = (store: Store) => {
    setCurrentStoreState(store);
    setCurrentStore(store);
    setDetailModal(true);
  };

  const getStatusTag = (status: Store['status']) => {
    const config = {
      normal: { color: 'success', text: '正常' },
      warning: { color: 'warning', text: '警告' },
      problem: { color: 'error', text: '异常' }
    };
    return <Tag color={config[status].color}>{config[status].text}</Tag>;
  };

  const stats = [
    { label: '门店总数', value: stores.length, color: '#1677ff' },
    {
      label: '正常门店',
      value: stores.filter((s) => s.status === 'normal').length,
      color: '#52c41a'
    },
    {
      label: '警告门店',
      value: stores.filter((s) => s.status === 'warning').length,
      color: '#faad14'
    },
    {
      label: '异常门店',
      value: stores.filter((s) => s.status === 'problem').length,
      color: '#ff4d4f'
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">门店列表</h2>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col span={6} key={index}>
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
        <div className="filter-bar">
          <Input
            prefix={<SearchOutlined />}
            placeholder="搜索门店名称/编码/地址"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="按路线筛选"
            value={selectedRoute}
            onChange={setSelectedRoute}
            style={{ width: 160 }}
            allowClear
          >
            {routes.map((route) => (
              <Option key={route} value={route}>
                {route}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="按状态筛选"
            value={selectedStatus}
            onChange={setSelectedStatus}
            style={{ width: 140 }}
            allowClear
          >
            <Option value="normal">正常</Option>
            <Option value="warning">警告</Option>
            <Option value="problem">异常</Option>
          </Select>
          <div style={{ flex: 1 }} />
          <span style={{ color: '#666' }}>共 {filteredStores.length} 家门店</span>
        </div>

        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
          dataSource={filteredStores}
          renderItem={(store) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => handleViewDetail(store)}
                bodyStyle={{ padding: 20 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                  <Avatar
                    size={48}
                    icon={<ShopOutlined />}
                    style={{ backgroundColor: '#1677ff' }}
                  />
                  <div style={{ marginLeft: 12, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#1f1f1f' }}>
                      {store.name}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>{store.code}</div>
                  </div>
                  {getStatusTag(store.status)}
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                  <EnvironmentOutlined style={{ marginRight: 6 }} />
                  {store.address}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color="blue">{store.route}</Tag>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ color: '#999' }}>评分: </span>
                    <span
                      style={{
                        color: store.score >= 90 ? '#52c41a' : store.score >= 70 ? '#faad14' : '#ff4d4f',
                        fontWeight: 600
                      }}
                    >
                      {store.score}
                    </span>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

      <Modal
        title="门店详情"
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            关闭
          </Button>
        ]}
        width={600}
      >
        {currentStore && (
          <Descriptions column={1} bordered size="middle">
            <Descriptions.Item label="门店名称">{currentStore.name}</Descriptions.Item>
            <Descriptions.Item label="门店编码">{currentStore.code}</Descriptions.Item>
            <Descriptions.Item label="所属区域">{currentStore.area}</Descriptions.Item>
            <Descriptions.Item label="所属路线">{currentStore.route}</Descriptions.Item>
            <Descriptions.Item label="门店地址">{currentStore.address}</Descriptions.Item>
            <Descriptions.Item label="店长">
              <Avatar size={24} style={{ marginRight: 8 }} />
              {currentStore.manager}
            </Descriptions.Item>
            <Descriptions.Item label="联系电话">
              <PhoneOutlined style={{ marginRight: 6 }} />
              {currentStore.phone}
            </Descriptions.Item>
            <Descriptions.Item label="门店状态">{getStatusTag(currentStore.status)}</Descriptions.Item>
            <Descriptions.Item label="上次巡检日期">{currentStore.lastInspectionDate}</Descriptions.Item>
            <Descriptions.Item label="综合评分">
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color:
                    currentStore.score >= 90
                      ? '#52c41a'
                      : currentStore.score >= 70
                      ? '#faad14'
                      : '#ff4d4f'
                }}
              >
                {currentStore.score}
              </span>
              <span style={{ color: '#999', marginLeft: 4 }}>分</span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default StoreList;
