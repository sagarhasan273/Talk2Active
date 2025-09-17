import type { LucideIcon } from 'lucide-react';

export interface InteractionButtonProps {
  icon: string;
  activeIcon?: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  activeColor: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  hoverColor: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  label: string;
}
