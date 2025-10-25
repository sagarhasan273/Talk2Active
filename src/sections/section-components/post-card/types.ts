import type { PostResponseType } from 'src/types/post';

export type PostType = 'image' | 'images' | 'video' | 'caption' | 'quote' | 'youtube';

export interface PostCardProps {
  post: PostResponseType;
}
