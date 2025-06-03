import 'dotenv/config';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import '../styles/globals.css';
import Menu from '../components/Menu';

export default function MyApp({ Component, pageProps }: AppProps) {
  // 纯客户端逻辑示例
  useEffect(() => {
    console.log('客户端已加载');
  }, []);

  return (
    <>
      {/* 全局菜单栏 */}
      <Menu />
      {/* 预留全局主题/i18n Provider */}
      <Component {...pageProps} />
    </>
  );
}