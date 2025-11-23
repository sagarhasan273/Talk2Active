import type { PostResponseType } from 'src/types/type-post';

export type PostTypeProps = 'image' | 'images' | 'gif' | 'youtube' | 'video' | 'caption' | 'quote';

export interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: PostResponseType;
}

export type PostContentProps = {
  content: string;
  authorName: string;
  tags: string[];
};
