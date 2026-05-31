import type { ReactNode } from "react";
import { ConfigProvider, theme } from "antd";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 6
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
