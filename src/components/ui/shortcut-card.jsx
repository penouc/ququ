import React, { useState, useEffect } from "react";
import { Keyboard, Edit3, X } from "lucide-react";

const ShortcutCard = ({
  title,
  description,
  shortcut,
  onShortcutChange,
  onRemove,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState([]);
  const [lastKeyTime, setLastKeyTime] = useState(0);

  const formatShortcut = (keys) => {
    if (!keys || keys.length === 0) return "未设置";
    return keys.join(" + ");
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedKeys([]);
    setLastKeyTime(0);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (recordedKeys.length > 0) {
      onShortcutChange(recordedKeys);
    }
    setRecordedKeys([]);
  };

  const handleKeyDown = (e) => {
    if (!isRecording) return;

    e.preventDefault();
    e.stopPropagation();

    const currentTime = Date.now();
    const timeDiff = currentTime - lastKeyTime;

    // 检测双击 (两次按键间隔小于300ms)
    if (lastKeyTime > 0 && timeDiff < 300 && recordedKeys.length === 1) {
      const doubleClickKey = recordedKeys[0] + " (双击)";
      setRecordedKeys([doubleClickKey]);
      handleStopRecording();
      return;
    }

    const key = e.key;
    const modifiers = [];

    if (e.ctrlKey || e.metaKey) modifiers.push(e.metaKey ? "Cmd" : "Ctrl");
    if (e.altKey) modifiers.push("Alt");
    if (e.shiftKey) modifiers.push("Shift");

    // 忽略单独的修饰键
    if (["Control", "Alt", "Shift", "Meta", "Command"].includes(key)) {
      return;
    }

    let displayKey = key;
    if (key === " ") displayKey = "Space";
    else if (key.length === 1) displayKey = key.toUpperCase();

    const fullKey = [...modifiers, displayKey];
    setRecordedKeys(fullKey);
    setLastKeyTime(currentTime);

    // 单键延迟结束录制，给双击检测留时间
    if (modifiers.length === 0) {
      setTimeout(() => {
        if (isRecording) {
          handleStopRecording();
        }
      }, 350);
    } else {
      // 组合键立即结束录制
      setTimeout(handleStopRecording, 100);
    }
  };

  useEffect(() => {
    if (isRecording) {
      window.addEventListener("keydown", handleKeyDown, true);
      return () => {
        window.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [isRecording, recordedKeys, lastKeyTime]);

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 chinese-title">
              {title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-sm font-mono text-gray-700 dark:text-gray-300 min-w-[80px]">
              {isRecording ? (
                <span className="text-red-500 animate-pulse">录制中...</span>
              ) : (
                formatShortcut(shortcut)
              )}
            </div>
          </div>

          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`px-2 py-1 text-xs font-medium rounded transition-colors flex-shrink-0 ${
              isRecording
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            {isRecording ? "停止" : "设置"}
          </button>

          {shortcut && shortcut.length > 0 && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="删除快捷键"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {isRecording && (
        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
          按下快捷键组合，或连续按同一键两次设置双击快捷键
        </div>
      )}
    </div>
  );
};

export default ShortcutCard;