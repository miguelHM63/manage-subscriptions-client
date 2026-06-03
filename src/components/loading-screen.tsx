import { Spin } from 'antd';

export function LoadingScreen() {
  return (
    <section className="h-screen w-full flex items-center justify-center">
      <Spin />
    </section>
  );
}
