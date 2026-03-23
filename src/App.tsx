import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Keyboard as KeyboardIcon, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Settings2, 
  ChevronDown, 
  ChevronUp,
  RotateCcw,
  X,
  Terminal,
  Monitor,
  Layers,
  Power,
  Code,
  Home,
  BookOpen,
  List
} from 'lucide-react';
import VisualKeyboard from './components/VisualKeyboard';
import ShaderBackground from "@/src/components/ui/shader-background";
import { GradientButton } from "@/src/components/ui/gradient-button";
import { NavBar } from "@/src/components/ui/tubelight-navbar";
import { Modifier, ActionCategory, ShortcutAction, SavedShortcut } from './types';

const NAV_ITEMS = [
  { name: 'Builder', url: '#', icon: Home },
  { name: 'Shortcuts', url: '#', icon: List },
  { name: 'Docs', url: '#', icon: BookOpen },
  { name: 'Settings', url: '#', icon: Settings2 }
];

const KEYBOARD_LAYOUTS = ['US', 'Arabic', 'UK', 'German', 'Other'];
const KEYBOARD_TYPES = ['Full Size', 'TKL', '60%', 'Laptop'];

const ACTION_CATEGORIES: ActionCategory[] = [
  'Open App',
  'Window Action',
  'Workspace',
  'System',
  'Custom Command'
];

const WINDOW_ACTIONS = [
  'Close active window',
  'Toggle fullscreen',
  'Toggle floating',
  'Pin window'
];

const SYSTEM_ACTIONS = [
  'Lock screen',
  'Logout menu',
  'Suspend'
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('Builder');

  // Setup State
  const [layout, setLayout] = useState('US');
  const [kbType, setKbType] = useState('Full Size');

  // Capture State
  const [isListening, setIsListening] = useState(false);
  const [activeModifiers, setActiveModifiers] = useState<Modifier[]>([]);
  const [activeMainKey, setActiveMainKey] = useState<string | null>(null);

  // Action State
  const [activeCategory, setActiveCategory] = useState<ActionCategory>('Open App');
  const [action, setAction] = useState<ShortcutAction>({ category: 'Open App', command: '' });

  // Advanced State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advanced, setAdvanced] = useState({
    repeat: false,
    release: false,
    locked: false,
    description: ''
  });

  // Result State
  const [generatedConfig, setGeneratedConfig] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Saved State
  const [savedShortcuts, setSavedShortcuts] = useState<SavedShortcut[]>([]);

  // Conflict State
  const [conflict, setConflict] = useState<{ type: 'shortcut' | 'action' | 'exact'; existing: SavedShortcut } | null>(null);

  const listeningRef = useRef(isListening);
  useEffect(() => {
    listeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!listeningRef.current) return;
      
      // Prevent browser shortcuts like Ctrl+S, Ctrl+P, etc.
      if (e.ctrlKey || e.altKey || e.metaKey) {
        e.preventDefault();
      }

      const modifiers: Modifier[] = [];
      if (e.metaKey || e.key === 'Meta' || e.key === 'OS' || e.key === 'Super') modifiers.push('SUPER');
      if (e.shiftKey || e.key === 'Shift') modifiers.push('SHIFT');
      if (e.ctrlKey || e.key === 'Control') modifiers.push('CTRL');
      if (e.altKey || e.key === 'Alt') modifiers.push('ALT');

      setActiveModifiers(Array.from(new Set(modifiers)));

      // If it's not just a modifier key, it's the main key
      const isModifier = ['Control', 'Shift', 'Alt', 'Meta', 'OS', 'Super'].includes(e.key);
      if (!isModifier) {
        let keyName = e.key.toUpperCase();
        if (keyName === ' ') keyName = 'SPACE';
        if (keyName === 'ESCAPE') keyName = 'ESC';
        setActiveMainKey(keyName);
        setIsListening(false); // Stop listening after main key is pressed
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyClick = (key: string) => {
    if (!isListening) return;

    const upperKey = key.toUpperCase();
    const isModifier = ['CTRL', 'CONTROL', 'SHIFT', 'ALT', 'SUPER', 'WIN', 'COMMAND', 'META', 'OS'].includes(upperKey);

    if (isModifier) {
      let mod: Modifier | null = null;
      if (upperKey === 'CTRL' || upperKey === 'CONTROL') mod = 'CTRL';
      if (upperKey === 'SHIFT') mod = 'SHIFT';
      if (upperKey === 'ALT') mod = 'ALT';
      if (upperKey === 'SUPER' || upperKey === 'WIN' || upperKey === 'COMMAND' || upperKey === 'META' || upperKey === 'OS') mod = 'SUPER';

      if (mod) {
        setActiveModifiers(prev => 
          prev.includes(mod!) ? prev.filter(m => m !== mod) : [...prev, mod!]
        );
      }
    } else {
      let keyName = key.toUpperCase();
      if (keyName === ' ') keyName = 'SPACE';
      if (keyName === 'ESCAPE') keyName = 'ESC';
      setActiveMainKey(keyName);
      setIsListening(false);
    }
  };

  const replaceShortcut = () => {
    if (!conflict || !generatedConfig) return;
    const newShortcuts = savedShortcuts.map(s => 
      s.id === conflict.existing.id ? {
        ...s,
        modifiers: [...activeModifiers],
        mainKey: activeMainKey!,
        action: { ...action },
        configLine: generatedConfig,
        ...advanced
      } : s
    );
    setSavedShortcuts(newShortcuts);
    setConflict(null);
    resetCapture();
  };

  const editShortcut = () => {
    if (!conflict) return;
    setActiveModifiers([...conflict.existing.modifiers]);
    setActiveMainKey(conflict.existing.mainKey);
    setAction({ ...conflict.existing.action });
    setActiveCategory(conflict.existing.action.category);
    setAdvanced({
      repeat: conflict.existing.repeat,
      release: conflict.existing.release,
      locked: conflict.existing.locked,
      description: conflict.existing.description || ''
    });
    setConflict(null);
    setGeneratedConfig(null);
  };

  const clearAllShortcuts = () => {
    if (window.confirm('Are you sure you want to clear all saved shortcuts?')) {
      setSavedShortcuts([]);
    }
  };

  const resetCapture = () => {
    setActiveModifiers([]);
    setActiveMainKey(null);
    setGeneratedConfig(null);
    setConflict(null);
  };

  const buildConfig = () => {
    if (!activeMainKey) return;

    const modStr = activeModifiers.join(' ');
    let dispatcher = 'exec';
    let params = '';

    switch (action.category) {
      case 'Open App':
        dispatcher = 'exec';
        params = action.command || '';
        break;
      case 'Window Action':
        if (action.windowAction === 'Close active window') dispatcher = 'killactive';
        else if (action.windowAction === 'Toggle fullscreen') dispatcher = 'fullscreen';
        else if (action.windowAction === 'Toggle floating') dispatcher = 'togglefloating';
        else if (action.windowAction === 'Pin window') dispatcher = 'pin';
        break;
      case 'Workspace':
        dispatcher = action.windowAction?.includes('Move') ? 'movetoworkspace' : 'workspace';
        params = action.workspaceNumber || '';
        break;
      case 'System':
        dispatcher = 'exec';
        if (action.systemAction === 'Lock screen') params = 'hyprlock';
        else if (action.systemAction === 'Logout menu') params = 'wlogout';
        else if (action.systemAction === 'Suspend') params = 'systemctl suspend';
        break;
      case 'Custom Command':
        dispatcher = action.dispatcher || 'exec';
        params = action.params || '';
        break;
    }

    const bindPrefix = 'bind';
    const flags = [];
    if (advanced.locked) flags.push('l');
    if (advanced.repeat) flags.push('e');
    if (advanced.release) flags.push('r');
    
    const fullBind = `${bindPrefix}${flags.join('')}`;
    const config = `${fullBind} = ${activeModifiers.join(' ')}${activeModifiers.length > 0 ? ', ' : ''}${activeMainKey}, ${dispatcher}, ${params}`;
    
    setGeneratedConfig(config);

    // Check for conflicts
    const exactMatch = savedShortcuts.find(s => 
      s.modifiers.sort().join(',') === activeModifiers.sort().join(',') && 
      s.mainKey === activeMainKey &&
      s.configLine === config
    );

    if (exactMatch) {
      setConflict({ type: 'exact', existing: exactMatch });
      return;
    }

    const shortcutConflict = savedShortcuts.find(s => 
      s.modifiers.sort().join(',') === activeModifiers.sort().join(',') && 
      s.mainKey === activeMainKey
    );

    if (shortcutConflict) {
      setConflict({ type: 'shortcut', existing: shortcutConflict });
      return;
    }

    const actionConflict = savedShortcuts.find(s => 
      s.action.category === action.category &&
      (s.action.command === action.command || s.action.windowAction === action.windowAction || s.action.workspaceNumber === action.workspaceNumber)
    );

    if (actionConflict) {
      setConflict({ type: 'action', existing: actionConflict });
    } else {
      setConflict(null);
    }
  };

  const saveShortcut = () => {
    if (!generatedConfig || !activeMainKey) return;

    const newShortcut: SavedShortcut = {
      id: crypto.randomUUID(),
      modifiers: [...activeModifiers],
      mainKey: activeMainKey,
      action: { ...action },
      configLine: generatedConfig,
      ...advanced
    };

    setSavedShortcuts([newShortcut, ...savedShortcuts]);
    resetCapture();
  };

  const deleteShortcut = (id: string) => {
    setSavedShortcuts(savedShortcuts.filter(s => s.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActionSummary = () => {
    switch (action.category) {
      case 'Open App': return `Open ${action.command || '...'}`;
      case 'Window Action': return action.windowAction || 'Perform window action';
      case 'Workspace': return `${action.windowAction || 'Switch to'} workspace ${action.workspaceNumber || '...'}`;
      case 'System': return action.systemAction || 'System action';
      case 'Custom Command': return `${action.dispatcher || 'exec'} ${action.params || ''}`;
      default: return '';
    }
  };

  return (
    <div className="min-h-screen text-zinc-100 font-sans selection:bg-cyan-500/30 relative">
      <ShaderBackground />
      <NavBar 
        items={NAV_ITEMS} 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsListening(false);
        }} 
      />
      
      <div className="max-w-3xl mx-auto px-6 pt-32 pb-12 space-y-12 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'Builder' ? (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Header */}
              <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Build Hyprland Shortcuts <span className="text-cyan-400">Visually</span>
          </h1>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Press your shortcut, choose an action, and generate ready-to-use Hyprland config.
          </p>
        </header>

        {/* Keyboard Setup */}
        <section className="glass rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold">Keyboard Setup</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Layout</label>
              <div className="relative">
                <select 
                  value={layout} 
                  onChange={(e) => setLayout(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                >
                  {KEYBOARD_LAYOUTS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Type</label>
              <div className="relative">
                <select 
                  value={kbType} 
                  onChange={(e) => setKbType(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                >
                  {KEYBOARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 italic">
            This helps the system display the right key labels and map your shortcut correctly.
          </p>
        </section>

        {/* Shortcut Capture */}
        <section className="glass rounded-3xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <KeyboardIcon className="w-4 h-4 text-zinc-400" />
              </div>
              <h2 className="text-lg font-semibold">Choose Your Shortcut</h2>
            </div>
            {(activeModifiers.length > 0 || activeMainKey) && (
              <button 
                onClick={resetCapture}
                className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-col items-center gap-8">
            <button
              onClick={() => {
                setIsListening(true);
                setActiveMainKey(null);
                setActiveModifiers([]);
                window.focus();
              }}
              className={`
                relative w-full py-12 rounded-2xl border-2 border-dashed transition-all duration-300 group
                ${isListening 
                  ? 'border-cyan-500 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.1)]' 
                  : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/50'}
              `}
            >
              <div className="flex flex-col items-center gap-3">
                {isListening ? (
                  <>
                    <div className="flex gap-1">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-2 h-2 rounded-full bg-cyan-500" 
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-cyan-500" 
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-cyan-500" 
                      />
                    </div>
                    <span className="text-sm font-medium text-cyan-400">Listening... press your shortcut</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {activeMainKey ? 'Press to re-capture' : 'Press your shortcut'}
                    </span>
                  </>
                )}
              </div>
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${layout}-${kbType}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <VisualKeyboard 
                  activeModifiers={activeModifiers} 
                  activeMainKey={activeMainKey} 
                  layout={layout}
                  kbType={kbType}
                  isListening={isListening}
                  onKeyClick={handleKeyClick}
                />
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {activeModifiers.map(mod => (
                <span key={mod} className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-300 shadow-sm">
                  {mod}
                </span>
              ))}
              {activeModifiers.length > 0 && activeMainKey && <Plus className="w-3 h-3 text-zinc-600" />}
              {activeMainKey && (
                <span className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/50 text-sm font-black text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  {activeMainKey}
                </span>
              )}
              {!activeMainKey && !isListening && (
                <span className="text-xs text-zinc-600 italic">No shortcut captured yet</span>
              )}
            </div>
          </div>
        </section>

        {/* Action Section */}
        <section className="glass rounded-3xl p-8 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Plus className="w-4 h-4 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold">Choose What It Does</h2>
          </div>

          <div className="space-y-8">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl">
              {ACTION_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setAction({ category: cat });
                  }}
                  className={`
                    px-4 py-2 rounded-xl text-xs font-medium transition-all
                    ${activeCategory === cat 
                      ? 'bg-zinc-800 text-white shadow-sm' 
                      : 'text-zinc-500 hover:text-zinc-300'}
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dynamic Inputs */}
            <div className="min-h-[100px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {activeCategory === 'Open App' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Command</label>
                      <div className="relative">
                        <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <input
                          type="text"
                          placeholder="kitty, firefox, thunar..."
                          value={action.command || ''}
                          onChange={(e) => setAction({ ...action, command: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {activeCategory === 'Window Action' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</label>
                      <div className="relative">
                        <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <select
                          value={action.windowAction || ''}
                          onChange={(e) => setAction({ ...action, windowAction: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                        >
                          <option value="" disabled>Select an action</option>
                          {WINDOW_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {activeCategory === 'Workspace' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</label>
                        <div className="relative">
                          <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                          <select
                            value={action.windowAction || 'Switch to workspace'}
                            onChange={(e) => setAction({ ...action, windowAction: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                          >
                            <option value="Switch to workspace">Switch to workspace</option>
                            <option value="Move window to workspace">Move window to workspace</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Workspace Number</label>
                        <input
                          type="number"
                          placeholder="1-10"
                          value={action.workspaceNumber || ''}
                          onChange={(e) => setAction({ ...action, workspaceNumber: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {activeCategory === 'System' && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</label>
                      <div className="relative">
                        <Power className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                        <select
                          value={action.systemAction || ''}
                          onChange={(e) => setAction({ ...action, systemAction: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                        >
                          <option value="" disabled>Select an action</option>
                          {SYSTEM_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {activeCategory === 'Custom Command' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Dispatcher</label>
                        <div className="relative">
                          <Code className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                          <input
                            type="text"
                            placeholder="exec, workspace, killactive..."
                            value={action.dispatcher || ''}
                            onChange={(e) => setAction({ ...action, dispatcher: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Params</label>
                        <input
                          type="text"
                          placeholder="kitty, 1, etc..."
                          value={action.params || ''}
                          onChange={(e) => setAction({ ...action, params: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Summary</span>
              <span className="text-sm font-semibold text-white">{getActionSummary()}</span>
            </div>
          </div>
        </section>

        {/* Advanced Section */}
        <section className="glass rounded-3xl overflow-hidden">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-6 hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings2 className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-semibold">Advanced Options</span>
            </div>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
          </button>
          
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-zinc-800"
              >
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={advanced.repeat}
                          onChange={(e) => setAdvanced({ ...advanced, repeat: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-zinc-800 rounded-full peer peer-checked:bg-cyan-500 transition-all" />
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all" />
                      </div>
                      <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Repeat</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={advanced.release}
                          onChange={(e) => setAdvanced({ ...advanced, release: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-zinc-800 rounded-full peer peer-checked:bg-cyan-500 transition-all" />
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all" />
                      </div>
                      <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Release</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={advanced.locked}
                          onChange={(e) => setAdvanced({ ...advanced, locked: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-zinc-800 rounded-full peer peer-checked:bg-cyan-500 transition-all" />
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all" />
                      </div>
                      <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Locked</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</label>
                    <input
                      type="text"
                      placeholder="Optional description for this shortcut..."
                      value={advanced.description}
                      onChange={(e) => setAdvanced({ ...advanced, description: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Build Button */}
        <div className="flex justify-center">
          <GradientButton
            onClick={buildConfig}
            disabled={!activeMainKey}
            className={!activeMainKey ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Build Config
          </GradientButton>
        </div>

        {/* Generated Result & Conflicts */}
        <AnimatePresence>
          {generatedConfig && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Conflict Warnings */}
              {conflict && (
                <div className={`
                  p-6 rounded-3xl border flex gap-4
                  ${conflict.type === 'exact' 
                    ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                    : 'bg-orange-500/10 border-orange-500/50 text-orange-400'}
                `}>
                  <AlertTriangle className="w-6 h-6 shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-bold">
                      {conflict.type === 'exact' ? 'Shortcut Already Exists' : 
                       conflict.type === 'shortcut' ? 'Shortcut Conflict' : 'Action Conflict'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {conflict.type === 'exact' ? 'This exact shortcut and action combination is already in your list.' :
                       conflict.type === 'shortcut' ? 'This shortcut is already assigned to another action.' :
                       'This action already exists with another shortcut.'}
                    </p>
                    {conflict.type !== 'exact' && (
                      <div className="flex gap-4 pt-2">
                        <button 
                          onClick={replaceShortcut}
                          className="text-xs font-bold underline underline-offset-4 hover:text-white transition-colors"
                        >
                          Replace existing
                        </button>
                        <button 
                          onClick={editShortcut}
                          className="text-xs font-bold underline underline-offset-4 hover:text-white transition-colors"
                        >
                          Edit existing
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Config Block */}
              <div className="glass rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Code className="w-4 h-4 text-zinc-400" />
                    </div>
                    <h2 className="text-lg font-semibold">Generated Config</h2>
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedConfig)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-cyan-400 overflow-x-auto whitespace-nowrap">
                  {generatedConfig}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Shortcut</span>
                    <p className="text-xs font-semibold text-zinc-300">{activeModifiers.join(' + ')} {activeModifiers.length > 0 ? '+' : ''} {activeMainKey}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Action</span>
                    <p className="text-xs font-semibold text-zinc-300">{getActionSummary()}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/50 space-y-1">
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Dispatcher</span>
                    <p className="text-xs font-semibold text-zinc-300">{generatedConfig.split(',')[1]?.trim() || 'exec'}</p>
                  </div>
                </div>

                <GradientButton
                  onClick={saveShortcut}
                  disabled={conflict?.type === 'exact'}
                  variant={conflict?.type === 'exact' ? 'default' : 'variant'}
                  className={`w-full ${conflict?.type === 'exact' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {conflict?.type === 'exact' ? 'Already Added' : 'Save to List'}
                </GradientButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Shortcuts */}
        <section className="glass rounded-3xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Layers className="w-4 h-4 text-zinc-400" />
              </div>
              <h2 className="text-lg font-semibold">Saved Shortcuts</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-zinc-600">{savedShortcuts.length} entries</span>
              {savedShortcuts.length > 0 && (
                <button 
                  onClick={clearAllShortcuts}
                  className="text-[10px] font-bold text-zinc-600 hover:text-red-400 transition-colors uppercase tracking-widest"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {savedShortcuts.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6 text-zinc-800" />
                </div>
                <p className="text-sm text-zinc-600">No shortcuts saved yet. Build one to see it here.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {savedShortcuts.map(s => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="group relative p-6 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {s.modifiers.map(m => (
                            <span key={m} className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400">
                              {m}
                            </span>
                          ))}
                          <span className="text-zinc-600 font-bold">+</span>
                          <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold text-cyan-400">
                            {s.mainKey}
                          </span>
                          <span className="mx-2 text-zinc-700">→</span>
                          <span className="text-sm font-semibold text-zinc-200">
                            {s.action.category === 'Open App' ? `Open ${s.action.command}` : 
                             s.action.category === 'Window Action' ? s.action.windowAction :
                             s.action.category === 'Workspace' ? `Workspace ${s.action.workspaceNumber}` :
                             s.action.category === 'System' ? s.action.systemAction :
                             s.action.dispatcher}
                          </span>
                        </div>
                        <div className="font-mono text-[11px] text-zinc-500 bg-black/30 p-2 rounded-lg border border-zinc-900">
                          {s.configLine}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => copyToClipboard(s.configLine)}
                          className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-white transition-all"
                          title="Copy Config"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteShortcut(s.id)}
                          className="p-2 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 border-t border-zinc-900">
          <p className="text-xs text-zinc-600">
            Designed for Hyprland users. Built with precision.
          </p>
        </footer>
            </motion.div>
          ) : activeTab === 'Shortcuts' ? (
            <motion.div
              key="shortcuts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-white">Saved Shortcuts</h2>
                <p className="text-zinc-400">View and manage your generated Hyprland configurations.</p>
              </header>
              <div className="glass rounded-3xl p-8">
                {savedShortcuts.length === 0 ? (
                  <div className="text-center py-12 text-zinc-500">No shortcuts saved yet.</div>
                ) : (
                  <div className="space-y-4">
                    {savedShortcuts.map(s => (
                      <div key={s.id} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-white">{s.modifiers.join(' + ')} + {s.mainKey}</div>
                          <div className="text-xs text-zinc-500 font-mono mt-1">{s.configLine}</div>
                        </div>
                        <button onClick={() => deleteShortcut(s.id)} className="text-zinc-500 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'Docs' ? (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-white">Documentation</h2>
                <p className="text-zinc-400">Learn how to use the Visual Shortcut Builder for Hyprland.</p>
              </header>
              <div className="glass rounded-3xl p-8 prose prose-invert max-w-none">
                <h3 className="text-cyan-400 font-bold mb-4">Getting Started</h3>
                <ul className="space-y-4 text-zinc-300">
                  <li>1. Choose your keyboard layout and type.</li>
                  <li>2. Click "Capture" and press your desired key combination.</li>
                  <li>3. Select an action from the categories.</li>
                  <li>4. Copy the generated config line to your <code>hyprland.conf</code>.</li>
                </ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-zinc-400">Customize your builder experience.</p>
              </header>
              <div className="glass rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Dark Mode</div>
                    <div className="text-xs text-zinc-500">Always on for that developer feel.</div>
                  </div>
                  <button 
                    className="w-10 h-6 bg-cyan-500 rounded-full flex items-center px-1 cursor-not-allowed opacity-80"
                    disabled
                  >
                    <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">Auto-Copy to Clipboard</div>
                    <div className="text-xs text-zinc-500">Automatically copy generated config.</div>
                  </div>
                  <button 
                    onClick={() => setAdvanced(prev => ({ ...prev, repeat: !prev.repeat }))} // Just using an existing state for demo
                    className="w-10 h-6 bg-zinc-800 rounded-full flex items-center px-1 transition-colors"
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
