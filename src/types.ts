export type Modifier = 'SUPER' | 'SHIFT' | 'CTRL' | 'ALT';

export type ActionCategory = 'Open App' | 'Window Action' | 'Workspace' | 'System' | 'Custom Command';

export interface ShortcutAction {
  category: ActionCategory;
  command?: string;
  windowAction?: string;
  workspaceNumber?: string;
  systemAction?: string;
  dispatcher?: string;
  params?: string;
}

export interface SavedShortcut {
  id: string;
  modifiers: Modifier[];
  mainKey: string;
  action: ShortcutAction;
  configLine: string;
  description?: string;
  repeat: boolean;
  release: boolean;
  locked: boolean;
}

export interface KeyboardLayout {
  name: string;
  rows: string[][];
}

export const US_LAYOUT: KeyboardLayout = {
  name: 'US',
  rows: [
    ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Super', 'Alt', 'Space', 'Alt', 'Super', 'Menu', 'Ctrl']
  ]
};

export const ARABIC_LAYOUT: KeyboardLayout = {
  name: 'Arabic',
  rows: [
    ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
    ['ذ', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '٠', '-', '=', 'Backspace'],
    ['Tab', 'ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د', '\\'],
    ['Caps', 'ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط', 'Enter'],
    ['Shift', 'ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ', 'Shift'],
    ['Ctrl', 'Super', 'Alt', 'Space', 'Alt', 'Super', 'Menu', 'Ctrl']
  ]
};

export const UK_LAYOUT: KeyboardLayout = {
  name: 'UK',
  rows: [
    ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '#'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", 'Enter'],
    ['Shift', '\\', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Super', 'Alt', 'Space', 'Alt', 'Super', 'Menu', 'Ctrl']
  ]
};

export const GERMAN_LAYOUT: KeyboardLayout = {
  name: 'German',
  rows: [
    ['Esc', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'],
    ['^', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß', '´', 'Backspace'],
    ['Tab', 'Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü', '*', 'Enter'],
    ['Caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä', "'"],
    ['Shift', '<', 'Y', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '-', 'Shift'],
    ['Ctrl', 'Super', 'Alt', 'Space', 'Alt', 'Super', 'Menu', 'Ctrl']
  ]
};

export const LAYOUTS: Record<string, KeyboardLayout> = {
  'US': US_LAYOUT,
  'Arabic': ARABIC_LAYOUT,
  'UK': UK_LAYOUT,
  'German': GERMAN_LAYOUT,
  'Other': US_LAYOUT
};
