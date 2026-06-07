import React, { useState, useMemo } from 'react';
import { Layout, Menu, Avatar, Dropdown, Badge } from 'antd';
import {
  ShopOutlined,
  UnorderedListOutlined,
  ScanOutlined,
  TagsOutlined,
  CameraOutlined,
  ToolOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  WifiOutlined,
  DisconnectOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import StoreList from './pages/StoreList';
import TaskList from './pages/TaskList';
import TaskWorkbench from './pages/TaskWorkbench';
import PriceCheck from './pages/PriceCheck';
import PromotionCheck from './pages/PromotionCheck';
import PhotoEvidence from './pages/PhotoEvidence';
import Rectification from './pages/Rectification';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const { Header, Sider, Content } = Layout;

const TaskWorkbenchWrapper: React.FC = () => {
  const { currentTask } = useAppStore();
  const navigate = useNavigate();

  if (!currentTask) {
    navigate('/tasks');
    return null;
  }

  return <TaskWorkbench task={currentTask} />;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, isOffline, rectifications, getPendingSyncCount, pendingSyncIds } = useAppStore();

  const menuItems = [
    {
      key: '/stores',
      icon: <ShopOutlined />,
      label: '门店列表'
    },
    {
      key: '/tasks',
      icon: <UnorderedListOutlined />,
      label: '巡店任务'
    },
    {
      key: '/price-check',
      icon: <ScanOutlined />,
      label: '商品核价'
    },
    {
      key: '/promotion-check',
      icon: <TagsOutlined />,
      label: '促销核验'
    },
    {
      key: '/photos',
      icon: <CameraOutlined />,
      label: '拍照取证'
    },
    {
      key: '/rectification',
      icon: <ToolOutlined />,
      label: '整改跟踪'
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: '统计报表'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置'
    }
  ];

  const pendingRectifications = rectifications.filter(
    (r) => r.status === 'pending' || r.status === 'processing'
  ).length;

  const pendingSyncCount = useMemo(() => getPendingSyncCount(), [pendingSyncIds]);

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息'
      },
      {
        type: 'divider' as const
      },
      {
        key: 'logout',
        label: '退出登录'
      }
    ]
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 12 : 16,
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.1)'
          }}
        >
          {collapsed ? '巡店' : '智慧零售巡店系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
            height: 64
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500, color: '#1f1f1f' }}>
            {menuItems.find((m) => m.key === location.pathname)?.label || '智慧零售巡店系统'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: isOffline ? '#ff4d4f' : '#52c41a' }}>
              {isOffline ? <DisconnectOutlined /> : <WifiOutlined />}
              <span style={{ fontSize: 12 }}>{isOffline ? '离线模式' : '在线'}</span>
            </div>
            {pendingSyncCount > 0 && (
              <Badge count={pendingSyncCount} size="small" color="#faad14">
                <SyncOutlined style={{ fontSize: 20, color: '#666', cursor: 'pointer' }} />
              </Badge>
            )}
            <Badge count={pendingRectifications} size="small">
              <BellOutlined style={{ fontSize: 20, color: '#666', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user.avatar} />
                <span style={{ color: '#333' }}>{user.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ overflow: 'auto', background: '#f5f5f5' }}>
          <Routes>
            <Route path="/" element={<TaskList />} />
            <Route path="/stores" element={<StoreList />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/task-workbench" element={<TaskWorkbenchWrapper />} />
            <Route path="/price-check" element={<PriceCheck />} />
            <Route path="/promotion-check" element={<PromotionCheck />} />
            <Route path="/photos" element={<PhotoEvidence />} />
            <Route path="/rectification" element={<Rectification />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;
