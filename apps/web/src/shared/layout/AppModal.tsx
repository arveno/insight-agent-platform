import type { ReactNode } from "react";
import { Modal, type ModalProps } from "antd";

export type AppModalProps = Omit<ModalProps, "children" | "footer" | "title"> & {
  children: ReactNode;
  footer?: ReactNode;
  title: ReactNode;
};

/**
 * 阻断确认容器。
 *
 * footer 文案和动作由调用方注入；
 * 默认不启用 Ant Design 内置 OK / Cancel 文案，避免 shared 内部固化用户文本。
 */
export function AppModal({ children, footer, title, ...modalProps }: AppModalProps) {
  return (
    <Modal {...modalProps} footer={footer ?? null} title={title}>
      {children}
    </Modal>
  );
}
