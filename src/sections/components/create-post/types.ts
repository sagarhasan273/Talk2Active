export interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
}
