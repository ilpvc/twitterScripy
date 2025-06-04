import { useState, useEffect } from 'react';
import Head from 'next/head';
import { getJobList, JobListResponse } from '../api/job';

// 示例脚本数据
const initialScripts = [
  { id: 1, name: '采集推文', status: 'stopped' },
  { id: 2, name: '自动点赞', status: 'running' },
  { id: 3, name: '数据同步', status: 'stopped' },
];

export default function Scripts() {
  const [scripts, setScripts] = useState(initialScripts);
  const [jobList, setJobList] = useState<JobListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getJobList()
      .then(data => setJobList(data))
      .catch(err => setError('获取脚本列表失败'))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = (id: number) => {
    setScripts(scripts.map(s => s.id === id ? { ...s, status: 'running' } : s));
  };
  const handleStop = (id: number) => {
    setScripts(scripts.map(s => s.id === id ? { ...s, status: 'stopped' } : s));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pt-8 md:pt-0">
      <Head>
        <title>脚本管理 | 我的应用</title>
      </Head>
      <main className="max-w-3xl mx-auto px-2 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">脚本管理</h1>
        {loading && <div className="text-center text-gray-500">加载中...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {jobList && (
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
              <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">后端环境：
                <span className={`ml-2 px-2 py-1 rounded text-xs ${jobList.isDev ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {jobList.isDev ? '开发环境' : '生产环境'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
                <div className="font-bold mb-2 text-blue-600 dark:text-blue-300">定时爬取脚本 (normal)</div>
                {jobList.normal.length === 0 ? <div className="text-gray-400">无</div> : jobList.normal.map(name => (
                  <div key={name} className="py-1 text-gray-800 dark:text-gray-200">{name}</div>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-800 rounded shadow p-4">
                <div className="font-bold mb-2 text-blue-600 dark:text-blue-300">定时查询最新推文脚本 (recent)</div>
                {jobList.recent.length === 0 ? <div className="text-gray-400">无</div> : jobList.recent.map(name => (
                  <div key={name} className="py-1 text-gray-800 dark:text-gray-200">{name}</div>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {scripts.map(script => (
            <div key={script.id} className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-gray-800 rounded shadow p-4">
              <div className="flex-1 text-lg font-medium text-gray-800 dark:text-gray-200">{script.name}</div>
              <div className="flex items-center mt-2 md:mt-0 space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${script.status === 'running' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                  {script.status === 'running' ? '运行中' : '已停止'}
                </span>
                {script.status === 'running' ? (
                  <button
                    onClick={() => handleStop(script.id)}
                    className="ml-2 px-3 py-1 rounded bg-red-500 text-white text-xs hover:bg-red-600 transition"
                  >
                    停止
                  </button>
                ) : (
                  <button
                    onClick={() => handleStart(script.id)}
                    className="ml-2 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
                  >
                    启动
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 