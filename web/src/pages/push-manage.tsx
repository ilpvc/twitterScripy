import { useEffect, useState } from 'react';
import Head from 'next/head';
import { supabase } from '@/lib/supabaseClient';
import { Input, Button, List, Modal, Form, message as antdMessage, Space, Typography, Card, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, MailOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface EmailItem {
  id: string;
  email: string;
  remark: string;
  user_id: string;
}

export default function PushManage() {
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [inputEmail, setInputEmail] = useState('');
  const [inputRemark, setInputRemark] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [editId, setEditId] = useState<string>('');
  const [editRemark, setEditRemark] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // 获取当前用户id
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        setUserId(data.user.id);
        fetchEmails(data.user.id);
      } else {
        antdMessage.error('请先登录');
      }
    });
    // eslint-disable-next-line
  }, []);

  // 查询邮箱
  const fetchEmails = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alert_emails')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });
    if (error) antdMessage.error('获取邮箱失败');
    setEmails(data || []);
    setLoading(false);
  };

  // 添加邮箱
  const handleAdd = async () => {
    if (!inputEmail.trim()) {
      antdMessage.warning('请输入邮箱');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inputEmail.trim())) {
      antdMessage.warning('邮箱格式不正确');
      return;
    }
    if (emails.length >= 5) {
      antdMessage.warning('最多只能添加5个邮箱');
      return;
    }
    setAddLoading(true);
    const { error } = await supabase.from('alert_emails').insert({
      email: inputEmail.trim(),
      remark: inputRemark.trim(),
      user_id: userId,
    });
    if (error) {
      antdMessage.error('添加失败，邮箱可能已存在');
    } else {
      antdMessage.success('添加成功');
      fetchEmails(userId);
      setInputEmail('');
      setInputRemark('');
    }
    setAddLoading(false);
  };

  // 删除邮箱
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除该邮箱？',
      icon: <DeleteOutlined style={{ color: 'red' }} />,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const { error } = await supabase.from('alert_emails').delete().eq('id', id);
        if (error) {
          antdMessage.error('删除失败');
        } else {
          antdMessage.success('删除成功');
          fetchEmails(userId);
        }
      },
    });
  };

  // 编辑备注
  const handleEditRemark = async () => {
    if (!editRemark.trim()) {
      antdMessage.warning('备注不能为空');
      return;
    }
    setEditLoading(true);
    const { error } = await supabase.from('alert_emails').update({ remark: editRemark.trim() }).eq('id', editId);
    if (error) {
      antdMessage.error('修改失败');
    } else {
      antdMessage.success('修改成功');
      fetchEmails(userId);
      setEditId('');
      setEditRemark('');
    }
    setEditLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', padding: '16px 0' }}>
      <Head>
        <title>推送管理 | 我的应用</title>
      </Head>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px' }}>
        <Card bordered style={{ marginBottom: 24 }}>
          <Title level={4} style={{ marginBottom: 16, textAlign: 'center' }}>邮箱管理</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
              placeholder="输入邮箱"
              value={inputEmail}
              onChange={e => setInputEmail(e.target.value)}
              size="large"
              prefix={<MailOutlined />}
              disabled={emails.length >= 5}
            />
            <Input
              placeholder="备注（可选）"
              value={inputRemark}
              onChange={e => setInputRemark(e.target.value)}
              size="large"
              maxLength={20}
              disabled={emails.length >= 5}
            />
            <Button
              type="primary"
              block
              size="large"
              loading={addLoading}
              onClick={handleAdd}
              icon={<PlusOutlined />}
              disabled={emails.length >= 5}
            >添加邮箱</Button>
          </Space>
        </Card>
        <Card bordered>
          <Title level={5} style={{ marginBottom: 16 }}>已添加邮箱（{emails.length}/5）</Title>
          <List
            loading={loading}
            locale={{ emptyText: '暂无邮箱' }}
            dataSource={emails}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => { setEditId(item.id); setEditRemark(item.remark); }}
                  >备注</Button>,
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    size="small"
                    onClick={() => handleDelete(item.id)}
                  >删除</Button>
                ]}
              >
                <Space direction="vertical" size={2}>
                  <span style={{ wordBreak: 'break-all', fontWeight: 500 }}>{item.email}</span>
                  <Tag color="blue" style={{ fontSize: 13 }}>{item.remark || '无备注'}</Tag>
                </Space>
              </List.Item>
            )}
          />
        </Card>
        <Modal
          open={!!editId}
          title="修改备注"
          onCancel={() => setEditId('')}
          onOk={handleEditRemark}
          confirmLoading={editLoading}
          okText="保存"
          cancelText="取消"
        >
          <Input
            value={editRemark}
            onChange={e => setEditRemark(e.target.value)}
            maxLength={20}
            placeholder="备注"
          />
        </Modal>
      </div>
    </div>
  );
} 