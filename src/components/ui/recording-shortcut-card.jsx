import React, { useState, useEffect, useCallback } from "react";
import { Keyboard, ChevronDown } from "lucide-react";

const RecordingShortcutCard = ({
  shortcut,
  activationMode = "toggle",
  onShortcutChange,
  onModeChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedKeys, setRecordedKeys] = useState([]);
  const [lastKeyTime, setLastKeyTime] = useState(0);
  const [showModeDropdown, setShowModeDropdown] = useState(false);

  const formatShortcut = (keys) => {
    if (!keys || keys.length === 0) return "快捷键";

    return keys.map(key => {
      // 处理双击快捷键
      if (typeof key === 'string' && key.includes('(双击)')) {
        const baseKey = key.replace(' (双击)', '');
        const formattedBase = formatSingleKey(baseKey);
        return formattedBase + " (双击)";
      }

      return formatSingleKey(key);
    }).join(" + ");
  };

  const formatSingleKey = (key) => {
    // 转换为macOS风格的符号
    switch (key) {
      case "Cmd":
      case "Meta":
        return "⌘";
      case "Ctrl":
        return "⌃";
      case "Alt":
        return "⌥";
      case "Shift":
        return "⇧";
      case "Space":
        return "Space";
      case "Enter":
        return "↩";
      case "Tab":
        return "⇥";
      case "Escape":
        return "⎋";
      case "Backspace":
        return "⌫";
      case "Delete":
        return "⌦";
      case "ArrowUp":
        return "↑";
      case "ArrowDown":
        return "↓";
      case "ArrowLeft":
        return "←";
      case "ArrowRight":
        return "→";
      default:
        // 保持原始按键，不转换为描述性文字
        return key;
    }
  };

  const activationModes = [
    // { value: "hold_or_toggle", label: "按住或切换", description: "自动检测" },
    { value: "toggle", label: "切换", description: "点击开始/停止" },
    // { value: "hold", label: "按住", description: "按下时录音" },
    // { value: "double_click", label: "双击", description: "快速按两次" },
  ];

  const getCurrentModeLabel = () => {
    const mode = activationModes.find(m => m.value === activationMode);
    return mode ? mode.label : "切换";
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedKeys([]);
    setLastKeyTime(0);
  };

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    setRecordedKeys([]);
    setLastKeyTime(0);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isRecording) return;

    // 阻止事件传播
    e.preventDefault();
    e.stopImmediatePropagation();

    const key = e.key;
    const code = e.code;

    console.log('录制按键详情:', {
      key,
      code,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      altKey: e.altKey,
      shiftKey: e.shiftKey,
      location: e.location,
      which: e.which,
      keyCode: e.keyCode
    });

    // 如果是 Escape，取消录制
    if (key === "Escape") {
      setIsRecording(false);
      setRecordedKeys([]);
      return;
    }

    // 忽略单独的修饰键
    if (["Control", "Alt", "Shift", "Meta", "Command", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "ShiftLeft", "ShiftRight", "MetaLeft", "MetaRight"].includes(key) ||
        ["ControlLeft", "ControlRight", "AltLeft", "AltRight", "ShiftLeft", "ShiftRight", "MetaLeft", "MetaRight"].includes(code)) {
      return;
    }

    const currentTime = Date.now();
    const modifiers = [];

    // 收集修饰键
    if (e.ctrlKey || e.metaKey) modifiers.push(e.metaKey ? "Cmd" : "Ctrl");
    if (e.altKey) modifiers.push("Alt");
    if (e.shiftKey) modifiers.push("Shift");

    // 处理主按键 - 优先使用 code 来获取物理按键
    let displayKey;

    // 对于数字键，使用 code 来避免被修饰键影响
    if (code.startsWith('Digit')) {
      displayKey = code.replace('Digit', ''); // Digit1 -> 1
    }
    // 对于字母键，使用 code 来获取物理位置
    else if (code.startsWith('Key')) {
      displayKey = code.replace('Key', ''); // KeyA -> A
    }
    // 对于功能键
    else if (code.startsWith('F') && code.length <= 3) {
      displayKey = code; // F1, F2, etc.
    }
    // 特殊键的映射
    else {
      switch (code) {
        case 'Space':
          displayKey = 'Space';
          break;
        case 'Enter':
          displayKey = 'Enter';
          break;
        case 'Tab':
          displayKey = 'Tab';
          break;
        case 'Escape':
          displayKey = 'Escape';
          break;
        case 'Backspace':
          displayKey = 'Backspace';
          break;
        case 'Delete':
          displayKey = 'Delete';
          break;
        case 'ArrowUp':
          displayKey = 'ArrowUp';
          break;
        case 'ArrowDown':
          displayKey = 'ArrowDown';
          break;
        case 'ArrowLeft':
          displayKey = 'ArrowLeft';
          break;
        case 'ArrowRight':
          displayKey = 'ArrowRight';
          break;
        // 符号键也用 code，避免被 Shift 影响
        case 'Semicolon':
          displayKey = ';';
          break;
        case 'Equal':
          displayKey = '=';
          break;
        case 'Comma':
          displayKey = ',';
          break;
        case 'Minus':
          displayKey = '-';
          break;
        case 'Period':
          displayKey = '.';
          break;
        case 'Slash':
          displayKey = '/';
          break;
        case 'Backquote':
          displayKey = '`';
          break;
        case 'BracketLeft':
          displayKey = '[';
          break;
        case 'Backslash':
          displayKey = '\\';
          break;
        case 'BracketRight':
          displayKey = ']';
          break;
        case 'Quote':
          displayKey = "'";
          break;
        default:
          // 如果 code 无法识别，回退到 key，但保持原样
          displayKey = key;
      }
    }

    const fullKey = [...modifiers, displayKey];

    console.log('按键处理结果:', {
      原始key: key,
      原始code: code,
      处理后的displayKey: displayKey,
      修饰键: modifiers,
      最终按键组合: fullKey
    });

    // 检测双击
    const timeDiff = currentTime - lastKeyTime;
    const currentKeyString = fullKey.join(' + ');
    const lastKeyString = recordedKeys.join(' + ');

    if (lastKeyTime > 0 && timeDiff < 400 && recordedKeys.length > 0 &&
        lastKeyString === currentKeyString) {
      // 双击检测成功
      const doubleClickKey = [currentKeyString + " (双击)"];
      console.log('检测到双击:', doubleClickKey);
      setRecordedKeys(doubleClickKey);
      setTimeout(() => {
        setIsRecording(false);
        onShortcutChange(doubleClickKey);
        setRecordedKeys([]);
      }, 50);
      return;
    }

    // 记录当前按键
    setRecordedKeys(fullKey);
    setLastKeyTime(currentTime);

    // 如果是单键，等待可能的双击
    if (modifiers.length === 0) {
      setTimeout(() => {
        if (isRecording) {
          setIsRecording(false);
          onShortcutChange(fullKey);
          setRecordedKeys([]);
        }
      }, 500);
    } else {
      // 组合键立即完成
      setTimeout(() => {
        setIsRecording(false);
        onShortcutChange(fullKey);
        setRecordedKeys([]);
      }, 100);
    }
  }, [isRecording, recordedKeys, lastKeyTime, onShortcutChange]);

  useEffect(() => {
    if (isRecording) {
      // 清除之前的状态
      setRecordedKeys([]);
      setLastKeyTime(0);

      console.log('开始录制快捷键...');

      const keydownHandler = (e) => handleKeyDown(e);

      // 添加事件监听器，使用捕获阶段确保优先处理
      document.addEventListener("keydown", keydownHandler, true);

      return () => {
        console.log('停止录制快捷键...');
        document.removeEventListener("keydown", keydownHandler, true);
      };
    }
  }, [isRecording, handleKeyDown]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          录音快捷键
        </h3>

        <div className="flex items-center space-x-3">
          {/* 快捷键输入框 */}
          <div
            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                {isRecording ? (
                  <span className="text-red-500 animate-pulse">录制中...</span>
                ) : (
                  formatShortcut(shortcut)
                )}
              </span>
              <Keyboard className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 激活方式下拉菜单 */}
          <div className="relative">
            <button
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2 min-w-[100px]"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {getCurrentModeLabel()}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showModeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                {activationModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => {
                      onModeChange(mode.value);
                      setShowModeDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {mode.label}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {mode.description}
                      </div>
                    </div>
                    {activationMode === mode.value && (
                      <span className="text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isRecording && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300">
            按下快捷键组合，或连续按同一键两次设置双击快捷键
          </div>
        )}

        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          配置快捷键及其激活方式：<strong>切换</strong>（点击开始/停止）。
        </p>
      </div>
    </div>
  );
};

export default RecordingShortcutCard;