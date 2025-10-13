export interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}

export type PostTypeProps = 'quote' | 'youtube' | 'image' | 'video';
