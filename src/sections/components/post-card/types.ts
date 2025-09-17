import type { PostResponseType, Post as PostType } from 'src/types/post';

export interface PostCardProps {
  post: PostResponseType;
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onRepost: (postId: string) => void;
}
