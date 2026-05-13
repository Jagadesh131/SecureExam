/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#F1F5F9',
    tint: '#3B82F6',
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#3B82F6',
    sidebar: '#0F172A',
    card: '#FFFFFF',
    accent: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    text: '#F1F5F9',
    background: '#0F172A',
    tint: '#3B82F6',
    icon: '#94A3B8',
    tabIconDefault: '#475569',
    tabIconSelected: '#3B82F6',
    sidebar: '#0F172A',
    card: '#1E293B',
    accent: '#3B82F6',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
  },
  admin: {
    background: '#050505',
    sidebar: '#000000',
    card: '#111111',
    text: '#FFFFFF',
    textMuted: '#999999',
    primary: '#FF3333', // Red
    secondary: '#8B5CF6', // Purple
    accent: '#FF3333',
    border: '#222222',
  },
  midnight: {
    background: '#050505',
    sidebar: '#000000',
    card: '#111111',
    surface: '#1E293B',
    text: '#FFFFFF',
    textMuted: '#94A3B8',
    primary: '#FF3333',
    accent: '#FF3333',
    border: '#1E293B',
    success: '#10B981',
    error: '#EF4444',
  }
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
