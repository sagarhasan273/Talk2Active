import type { PostResponseType } from 'src/types/type-post';

export type PostType = 'image' | 'images' | 'video' | 'caption' | 'quote' | 'youtube';

export interface PostCardProps {
  post: PostResponseType;
}
