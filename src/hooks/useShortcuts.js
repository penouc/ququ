import { useState, useEffect, useCallback } from 'react';

const useShortcuts = () => {
  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const savedShortcuts = localStorage.getItem('ququ-shortcuts');
      if (savedShortcuts) {
        const parsed = JSON.parse(savedShortcuts);
        // 验证数据结构
        if (parsed && typeof parsed === 'object' && 'recordingShortcut' in parsed) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('解析快捷键失败:', error);
    }
    // 返回默认值
    return {
      recordingShortcut: ['Cmd', 'Shift', 'Space'],
      recordingMode: 'toggle',
    };
  });

  // 监听localStorage变化，实现跨窗口同步
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'ququ-shortcuts') {
        try {
          const newShortcuts = JSON.parse(event.newValue);
          if (newShortcuts && typeof newShortcuts === 'object') {
            console.log('检测到快捷键变化，正在同步:', newShortcuts);
            setShortcuts(newShortcuts);
          }
        } catch (error) {
          console.error('同步快捷键失败:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const saveShortcuts = useCallback((newShortcuts) => {
    try {
      const shortcutsString = JSON.stringify(newShortcuts);
      localStorage.setItem('ququ-shortcuts', shortcutsString);
      setShortcuts(newShortcuts);
    } catch (error) {
      console.error('保存快捷键失败:', error);
    }
  }, []);

  const setRecordingShortcut = useCallback((keys) => {
    saveShortcuts({ ...shortcuts, recordingShortcut: keys });
  }, [shortcuts, saveShortcuts]);

  const setRecordingMode = useCallback((mode) => {
    saveShortcuts({ ...shortcuts, recordingMode: mode });
  }, [shortcuts, saveShortcuts]);

  const removeRecordingShortcut = useCallback(() => {
    const newShortcuts = { ...shortcuts };
    delete newShortcuts.recordingShortcut;
    saveShortcuts(newShortcuts);
  }, [shortcuts, saveShortcuts]);

  const resetShortcuts = useCallback(() => {
    const defaultShortcuts = {
      recordingShortcut: ['Cmd', 'Shift', 'Space'],
      recordingMode: 'toggle',
    };
    saveShortcuts(defaultShortcuts);
  }, [saveShortcuts]);

  const matchesShortcut = useCallback((pressedKeys, shortcutKeys) => {
    if (!shortcutKeys || shortcutKeys.length === 0) {
      return false;
    }
    if (pressedKeys.length !== shortcutKeys.length) {
      return false;
    }

    const sortedPressed = [...pressedKeys].sort();
    const sortedShortcut = [...shortcutKeys].sort();

    return sortedPressed.every((key, index) => key === sortedShortcut[index]);
  }, []);

  return {
    shortcuts,
    setShortcuts: saveShortcuts,
    setRecordingShortcut,
    setRecordingMode,
    removeRecordingShortcut,
    resetShortcuts,
    matchesShortcut,
  };
};

export { useShortcuts };