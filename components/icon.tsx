import React from 'react';
import * as Lucide from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof Lucide;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const LucideIcon = Lucide[name] as Lucide.LucideIcon;
  if (!LucideIcon) return null;
  return <LucideIcon {...(props as any)} />;
};