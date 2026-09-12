export type ResizeWidthRightProps = {
  width: number;
  onWidthChange: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
};
export type ResizeWidthLeftProps = {
  width: number;
  onWidthChange: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  children: React.ReactNode;
};
export type ResizeHeightTopProps = {
  height: number;
  onHeightChange: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
  children: React.ReactNode;
};
export type ResizeHeightBottomProps = {
  height: number;
  onHeightChange: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
  children: React.ReactNode;
};
