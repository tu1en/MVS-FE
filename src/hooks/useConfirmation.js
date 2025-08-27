import { useState } from 'react';

/**
 * Custom hook for managing confirmation modals
 * @returns {object} - Object containing modal state and control functions
 */
export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: "Xác nhận",
    message: "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    type: "warning",
    icon: null,
    onConfirm: () => {}
  });
  const [loading, setLoading] = useState(false);

  /**
   * Show confirmation modal
   * @param {object} options - Modal configuration options
   */
  const showConfirmation = (options = {}) => {
    setConfig({
      title: options.title || "Xác nhận",
      message: options.message || "Bạn có chắc chắn muốn thực hiện hành động này?",
      confirmText: options.confirmText || "Xác nhận",
      cancelText: options.cancelText || "Hủy",
      type: options.type || "warning",
      icon: options.icon || null,
      onConfirm: options.onConfirm || (() => {})
    });
    setIsOpen(true);
    setLoading(false);
  };

  /**
   * Hide confirmation modal
   */
  const hideConfirmation = () => {
    setIsOpen(false);
    setLoading(false);
  };

  /**
   * Handle confirmation action
   */
  const handleConfirm = async () => {
    try {
      setLoading(true);
      await config.onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setLoading(false);
      hideConfirmation();
    }
  };

  // Predefined confirmation types for common use cases
  const confirmDelete = (itemName, onConfirm) => {
    showConfirmation({
      title: "Xóa dữ liệu",
      message: `Bạn có chắc chắn muốn xóa "${itemName}"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
      icon: "🗑️",
      onConfirm
    });
  };

  const confirmRemove = (itemName, onConfirm) => {
    showConfirmation({
      title: "Loại bỏ",
      message: `Bạn có chắc chắn muốn loại bỏ "${itemName}" khỏi danh sách?`,
      confirmText: "Loại bỏ",
      cancelText: "Hủy",
      type: "warning",
      icon: "⚠️",
      onConfirm
    });
  };

  const confirmSave = (onConfirm) => {
    showConfirmation({
      title: "Lưu thay đổi",
      message: "Bạn có muốn lưu các thay đổi đã thực hiện?",
      confirmText: "Lưu",
      cancelText: "Hủy",
      type: "success",
      icon: "💾",
      onConfirm
    });
  };

  const confirmAction = (actionName, onConfirm) => {
    showConfirmation({
      title: "Xác nhận hành động",
      message: `Bạn có chắc chắn muốn ${actionName}?`,
      confirmText: "Thực hiện",
      cancelText: "Hủy",
      type: "info",
      icon: "ℹ️",
      onConfirm
    });
  };

  return {
    // Modal state
    isOpen,
    config,
    loading,
    
    // Control functions
    showConfirmation,
    hideConfirmation,
    handleConfirm,
    
    // Predefined confirmations
    confirmDelete,
    confirmRemove,
    confirmSave,
    confirmAction
  };
};
