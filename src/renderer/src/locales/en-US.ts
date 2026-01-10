export default {
  common: {
    connect: 'Connect Device',
    connected: 'Device Connected',
    disconnected: 'Device Disconnected',
    save: 'Save',
    reset: 'Reset',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    apply: 'Apply',
    unsupported: 'Not Supported'
  },
  header: {
    title: 'Universal Gaming Mouse Driver',
    subtitle: 'Support Multiple Gaming Mice',
    connectionMode: {
      label: 'Mode',
      usb: 'USB',
      wireless: '2.4G'
    }
  },
  footer: {
    version: 'Universal Gaming Mouse Driver v1.0.1',
    copyright: '© 2026 Bojuxi Technology Co., Ltd. All Rights Reserved'
  },
  tabs: {
    basic: 'Basic Settings',
    backlight: 'Backlight',
    buttons: 'Button Mapping',
    performance: 'Performance',
    device: 'Device Info'
  },
  deviceStatus: {
    battery: 'Battery',
    reportRate: 'Report Rate',
    dpi: 'Current DPI',
    backlight: 'Backlight Mode'
  },
  basicSettings: {
    reportRate: {
      title: 'Report Rate',
      description: 'Adjust mouse report rate, higher rate provides smoother cursor movement',
      notSupported: 'Current device does not support report rate settings'
    },
    dpi: {
      title: 'DPI Settings',
      description: 'Adjust mouse sensitivity, higher DPI means faster cursor movement',
      level: 'DPI Level',
      current: 'Current DPI',
      levelOption: 'Level {level} - {value} DPI',
      supportedCount: '({count} levels supported)',
      notSupported: 'Current device does not support DPI settings',
      totalLevels: '{count} levels total',
      currentLevel: 'Current Level',
      levelLabel: 'Level {level}',
      currentBadge: 'Current',
      selected: 'Selected',
      switchLevel: 'Switch'
    },
    scrollDirection: {
      title: 'Scroll Direction',
      description: 'Set mouse wheel scroll direction',
      normal: 'Normal',
      reverse: 'Reverse',
      normalHint: 'Scroll down to move page down',
      reverseHint: 'Scroll down to move page up',
      notSupported: 'Current device does not support scroll direction settings'
    }
  },
  backlightSettings: {
    mode: {
      title: 'Backlight Mode',
      description: 'Select mouse LED backlight effect mode',
      off: 'Off',
      on: 'Always On',
      breathing: 'Breathing',
      apm: 'APM Mode',
      spectrum: 'Full Spectrum',
      notSupported: 'Current device does not support backlight'
    },
    color: {
      title: 'Backlight Color & Brightness',
      description: 'Customize mouse backlight color and brightness',
      colorLabel: 'Backlight Color',
      colorPlaceholder: 'Hex color value',
      brightness: 'Brightness',
      frequency: 'Breathing Frequency',
      frequencyLabels: ['Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'],
      notSupported: 'Current device does not support backlight color and brightness settings'
    }
  },
  buttonMapping: {
    title: 'Mouse Button Customization',
    description:
      'Customize mouse button functions, can be set to mouse functions, multimedia keys or keyboard combinations',
    buttonNames: [
      'Left Button (Button 1)',
      'Right Button (Button 2)',
      'Middle Button (Button 3)',
      'Forward (Button 4)',
      'Back (Button 5)',
      'DPI Button (Button 6)'
    ],
    leftKeyDisabled: 'Left button cannot be modified',
    restoreDefault: 'Restore Default',
    resetAll: 'Reset All Buttons',
    resetAllConfirm: 'Are you sure you want to reset all buttons to default settings?',
    resetAllSuccess: 'All buttons have been reset to default settings',
    saveFailedNoLeftClick: 'Save failed, at least one left click button is required',
    tabs: {
      mouse: 'Mouse Functions',
      dpi: 'DPI Functions',
      multimedia: 'Multimedia',
      keyboard: 'Keyboard Keys',
      macro: 'Macro'
    },
    // Mouse buttons
    mouseButtons: {
      left: 'Left Click',
      right: 'Right Click',
      middle: 'Middle Click',
      back: 'Back',
      forward: 'Forward',
      disabled: 'Disabled'
    },
    // DPI buttons
    dpiButtons: {
      increase: 'DPI+',
      decrease: 'DPI-',
      increaseCycle: 'DPI+ Cycle',
      decreaseCycle: 'DPI- Cycle'
    },
    // Multimedia buttons
    multimediaButtons: {
      volUp: 'Volume Up',
      volDown: 'Volume Down',
      mute: 'Mute',
      playPause: 'Play/Pause',
      stop: 'Stop',
      prev: 'Previous Track',
      next: 'Next Track',
      media: 'Media Player',
      home: 'Home',
      refresh: 'Web Refresh',
      webStop: 'Web Stop',
      webForward: 'Web Forward',
      webBack: 'Web Back',
      favorites: 'Web Favorites',
      search: 'Web Search',
      calculator: 'Calculator',
      myComputer: 'My Computer',
      mail: 'Mail',
      brightnessUp: 'Brightness Up',
      brightnessDown: 'Brightness Down'
    },
    // Display names
    displayNames: {
      macro: 'Macro {index}',
      disabled: 'Disabled',
      scrollUp: 'Scroll↑',
      scrollDown: 'Scroll↓',
      scrollLeft: 'Scroll←',
      scrollRight: 'Scroll→',
      scroll: 'Scroll',
      none: 'None',
      unknown: 'Unknown({code})'
    },
    // Categories
    categories: {
      basic: 'Basic Functions',
      special: 'Special Functions',
      dpi: 'DPI Functions',
      volume: 'Volume Control',
      playback: 'Playback Control',
      system: 'System Functions',
      browser: 'Browser'
    },
    // Modifiers
    modifiers: {
      ctrl: 'Ctrl',
      shift: 'Shift',
      alt: 'Alt',
      win: 'Win'
    },
    keyboard: {
      modifiers: 'Modifiers (Multiple Selection)',
      selectKey: 'Select Key',
      selectKeyPlaceholder: '-- Select a key --',
      key1: 'Key 1 (Optional)',
      key2: 'Key 2 (Optional)',
      key2Placeholder: '-- Select a key --',
      saveKey: 'Save Key',
      groups: {
        alphabet: 'Alphabet Keys',
        number: 'Number Keys',
        function: 'Function Keys F1-F12',
        extendedFunction: 'Extended Function Keys F13-F24',
        special: 'Special Keys',
        punctuation: 'Punctuation Keys',
        numpad: 'Numpad',
        modifier: 'Modifier Keys (Single)'
      }
    },
    macro: {
      list: 'Macro List',
      listHint: 'Manage your macros, up to 10 macros can be saved',
      empty: 'No macros yet, click "New Macro" to start creating',
      newMacro: 'New Macro',
      deleteMacro: 'Delete Selected Macro',
      deleteConfirm: 'Are you sure you want to delete {name}? This action cannot be undone.',
      maxReached: 'Maximum of {max} macros can be created',
      record: 'Macro Recording',
      startRecord: 'Start Recording',
      stopRecord: 'Stop Recording',
      recording: 'Recording... Please perform your actions, then click "Stop Recording"',
      connectFirst: 'Please connect device first',
      selectFirst: 'Please select or create a macro first',
      eventList: 'Macro Event List',
      emptyEvents: 'Recorded macro events will be displayed here',
      deleteSelected: 'Delete Selected',
      clearAll: 'Clear All',
      clearAllConfirm: 'Are you sure you want to clear all events?',
      saveToDevice: 'Save Macro to Device',
      saveSuccess: '{name} saved',
      saveError: 'Failed to save to device: {message}',
      eventEmpty: 'Macro events cannot be empty',
      nameEmpty: 'Macro name cannot be empty',
      selectMacro: 'Please select a macro first',
      keyDown: 'Down',
      keyUp: 'Up',
      delay: 'Delay {ms}ms',
      eventCount: '{count} events',
      binding: {
        title: 'Bind Macro to Current Button',
        selectMacro: 'Select macro to bind',
        selectMacroPlaceholder: '-- Select a macro --',
        loopMode: 'Loop Mode',
        loopRelease: 'Loop until button release',
        loopToggle: 'Toggle mode (press to start, press again to stop)',
        loopAnykey: 'Loop until any key press',
        loopCount: 'Loop specified times',
        loopCountLabel: 'Loop Count (1-65532)',
        loopCountPlaceholder: 'Enter loop count',
        bindToButton: 'Bind to Button {button}'
      }
    }
  },
  deviceInfo: {
    title: 'Device Information',
    name: 'Device Name',
    model: 'Device Model',
    firmwareVersion: 'Firmware Version',
    connectionType: 'Connection Type',
    vidPid: 'VID/PID',
    protocol: 'Device Protocol',
    status: 'Device Status',
    statusConnected: 'Connected',
    statusDisconnected: 'Disconnected',
    battery: {
      title: 'Battery & Maintenance',
      level: 'Battery Level',
      notCharging: 'Not Charging',
      notConnected: 'Device Not Connected',
      checkUpdate: 'Check Firmware Update',
      checkingUpdate:
        'Checking for firmware updates...\n\nCurrent firmware is up to date, no update needed',
      restoreDefaults: 'Restore Factory Settings',
      restoreConfirm:
        'Are you sure you want to restore factory settings? This will clear all custom settings and restore default values.',
      restoring: 'Restoring factory settings...',
      restoreSuccess: 'Factory settings restored successfully'
    }
  },
  notification: {
    connectSuccess: 'Connection Successful',
    connectFailed: 'Connection Failed'
  },
  performanceSettings: {
    tracking: {
      title: 'Motion Tracking',
      description: 'Adjust mouse motion tracking performance parameters',
      motionSync: {
        title: 'Motion Sync',
        description: 'Apply smoothing algorithm to mouse movement for more accurate tracking, adds slight latency'
      },
      angleSnapping: {
        title: 'Angle Snapping',
        description: 'Correct offset jitter during straight-line mouse movement, ideal for design and drawing'
      },
      rippleControl: {
        title: 'Ripple Control',
        description: 'Apply algorithm correction at high speeds to eliminate wave-like jitter'
      },
      longRangeMode: {
        title: 'Long Range Mode',
        description: 'Improve wireless performance at long distances, but increases power consumption'
      }
    },
    debounce: {
      title: 'Button Debounce Delay',
      description: 'Prevent repeated or accidental triggers caused by rapid clicking or button jitter'
    },
    sleep: {
      title: 'Sleep Timer',
      description: 'Mouse automatically enters sleep mode after being idle to save power. Set your preferred idle time'
    },
    lod: {
      title: 'LOD (Lift-off Distance)',
      description: 'Maximum working distance between mouse bottom and surface'
    },
    sensorRotation: {
      title: 'Sensor Rotation',
      description: 'Achieve precise horizontal movement regardless of your mouse grip style',
      enable: 'Enable Sensor Rotation',
      enableDesc: 'When enabled, adjust sensor angle to match your grip style'
    }
  }
}
