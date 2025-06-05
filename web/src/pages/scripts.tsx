import { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  getJobList,
  startJob,
  stopJob,
  JobListResponse,
  JobActionResponse
} from '@/api/job';
import { AxiosResponse } from 'axios';
import { Input, Button, List, Modal, Tag, message as antdMessage, Space, Typography, Card } from 'antd';
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Title } = Typography;

const RECENT_KEY = 'recent_twitter_users';
const MAX_RECENT = 8;

export default function Scripts() {
  const [jobList, setJobList] = useState<JobListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [inputUser, setInputUser] = useState('');
  const [startLoading, setStartLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState<string>('');
  const [recentUsers, setRecentUsers] = useState<string[]>([]);

  // 获取脚本列表
  const fetchJobList = () => {
    setLoading(true);
    getJobList()
      .then((res: AxiosResponse<JobListResponse>) => setJobList(res))
      .catch(() => antdMessage.error('获取脚本列表失败'))
      .finally(() => setLoading(false));
  };

  // 读取最近用户名
  useEffect(() => {
    fetchJobList();
    const local = localStorage.getItem(RECENT_KEY);
    if (local) {
      setRecentUsers(JSON.parse(local));
    }
  }, []);

  // 启动任务
  const handleStart = async () => {
    if (!inputUser.trim()) {
      antdMessage.warning('请输入Twitter用户名');
      return;
    }
    setStartLoading(true);
    try {
      const res = await startJob(inputUser.trim());
      antdMessage.success(res.message || '启动成功');
      fetchJobList();
      // 更新最近用户名
      let newRecent = [inputUser.trim(), ...recentUsers.filter(u => u !== inputUser.trim())];
      if (newRecent.length > MAX_RECENT) newRecent = newRecent.slice(0, MAX_RECENT);
      setRecentUsers(newRecent);
      localStorage.setItem(RECENT_KEY, JSON.stringify(newRecent));
      setInputUser('');
    } catch (e) {
      antdMessage.error('启动失败');
    } finally {
      setStartLoading(false);
    }
  };

  // 停止任务，弹窗确认
  const handleStop = (user: string) => {
    confirm({
      title: `确认停止该脚本？`,
      icon: <ExclamationCircleOutlined />,
      content: `Twitter 用户：${user}`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        setStopLoading(user);
        try {
          const res = await stopJob(user);
          antdMessage.success(res.data.message || '已停止');
          fetchJobList();
        } catch {
          antdMessage.error('停止失败');
        } finally {
          setStopLoading('');
        }
      },
    });
  };

  // 点击最近用户名填充输入框
  const handleRecentClick = (user: string) => {
    setInputUser(user);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '16px 0' }}>
      <Head>
        <title>脚本管理 | 我的应用</title>
      </Head>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
        <Card bordered style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>启动Twitter爬取脚本</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="输入Twitter用户名"
              value={inputUser}
              onChange={e => setInputUser(e.target.value)}
              onPressEnter={handleStart}
              size="large"
              allowClear
              autoFocus
              suffix={<PlusOutlined onClick={handleStart} style={{ color: '#1677ff', cursor: 'pointer' }} />}
            />
            {recentUsers.length > 0 && (
              <div>
                <span style={{ color: '#888', fontSize: 13 }}>最近启动：</span>
                <Space wrap>
                  {recentUsers.map(user => (
                    <Tag key={user} color="blue" style={{ cursor: 'pointer' }} onClick={() => handleRecentClick(user)}>{user}</Tag>
                  ))}
                </Space>
              </div>
            )}
            <Button
              type="primary"
              block
              size="large"
              loading={startLoading}
              onClick={handleStart}
              icon={<PlusOutlined />}
            >启动</Button>
          </Space>
        </Card>
        <Card bordered>
          <Title level={5} style={{ marginBottom: 16 }}>任务列表</Title>
          <List
            loading={loading}
            locale={{ emptyText: '暂无任务' }}
            dataSource={jobList?.normal || []}
            renderItem={user => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    danger
                    size="small"
                    loading={stopLoading === user}
                    onClick={() => handleStop(user)}
                  >停止</Button>
                ]}
              >
                <span style={{ wordBreak: 'break-all' }}>{user}</span>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </div>
  );
} 