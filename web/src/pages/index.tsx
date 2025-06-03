import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <Head>
        <title>首页 | 我的应用</title>
      </Head>
      <main className="w-full max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
          欢迎来到首页
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          这里是响应式首页示例，支持桌面和移动端自适应。
        </p>
      </main>
    </div>
  );
} 