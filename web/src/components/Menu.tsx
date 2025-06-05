import { useState } from 'react';
import { useRouter } from 'next/router';

const menuItems = [
  { label: '首页', path: '/' },
  { label: '脚本管理', path: '/scripts' },
  { label: '登录', path: '/login' },
  { label: '推送管理', path: '/push-manage'}
  // 可扩展更多菜单项
];

export default function Menu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleNav = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-20 top-0 left-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => handleNav('/')}>我的应用</span>
          </div>
          <div className="hidden md:flex space-x-4">
            {menuItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${router.pathname === item.path ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700'}`}
              >
                {item.label}
              </button>
            ))}
            {/* 预留i18n和主题切换按钮 */}
            <button className="ml-2 px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600">🌐</button>
            <button className="ml-2 px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600">🌓</button>
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setOpen(!open)} className="text-gray-700 dark:text-gray-200 focus:outline-none">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* 移动端菜单 */}
      {open && (
        <div className="md:hidden bg-white dark:bg-gray-800 px-2 pt-2 pb-3 space-y-1 shadow">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${router.pathname === item.path ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700'}`}
            >
              {item.label}
            </button>
          ))}
          {/* 预留i18n和主题切换按钮 */}
          <div className="flex space-x-2 mt-2">
            <button className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600">🌐</button>
            <button className="px-2 py-1 rounded text-xs border border-gray-300 dark:border-gray-600">🌓</button>
          </div>
        </div>
      )}
    </nav>
  );
} 