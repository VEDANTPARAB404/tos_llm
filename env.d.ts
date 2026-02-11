declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}

declare module "lucide-react" {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = FC<IconProps>;
  export const ShieldAlert: Icon;
  export const FileText: Icon;
  export const Link: Icon;
  export const AlertTriangle: Icon;
  export const Info: Icon;
  export const ArrowRight: Icon;
  export const Search: Icon;
  export const ChevronRight: Icon;
  export const Copy: Icon;
  export const Check: Icon;
  export const RefreshCcw: Icon;
  export const History: Icon;
  export const Trash2: Icon;
  export const Zap: Icon;
  export const Clock: Icon;
}