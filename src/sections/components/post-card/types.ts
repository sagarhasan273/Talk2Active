import type { Post as PostType } from 'src/types/post';

export interface PostCardProps {
  post: PostType;
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
}
