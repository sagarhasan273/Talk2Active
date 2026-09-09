import type { ChatMessage } from './types';

export const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢'];

/** The demo viewer — matches SELF_ID used elsewhere in the audio stage demo. */
export const CURRENT_USER = {
  id: 'u4',
  name: 'Sarah M.',
  avatarUrl: 'https://i.pravatar.cc/150?img=5',
};

export const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    authorId: 'u1',
    authorName: 'Sagar Hasan',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    text: 'Welcome everyone! Feel free to jump in 🎙️',
    timestamp: '10:01 AM',
    reactions: [{ emoji: '👍', count: 3, reactedBySelf: false }],
  },
  {
    id: 'm2',
    authorId: 'u2',
    authorName: 'Anna K.',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    text: 'Excited for this one! Been wanting to practice my Spanish.',
    timestamp: '10:02 AM',
  },
  {
    id: 'm3',
    authorId: 'u3',
    authorName: 'Marcus V.',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    text: 'Same here — is it okay if I just listen for the first few minutes?',
    timestamp: '10:03 AM',
    replyToId: 'm2',
  },
  {
    id: 'm4',
    authorId: 'u5',
    authorName: 'Kenji T.',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    text: "Of course, no pressure at all. That's what this room is for.",
    timestamp: '10:04 AM',
    editedAt: '10:05 AM',
    reactions: [
      { emoji: '❤️', count: 2, reactedBySelf: true },
      { emoji: '😂', count: 1, reactedBySelf: false },
    ],
  },
  // Private message TO the current viewer — should render for self.
  {
    id: 'm5',
    authorId: 'u2',
    authorName: 'Anna K.',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    text: 'Hey, loved your pronunciation earlier — want to pair up next round?',
    timestamp: '10:06 AM',
    privateTo: { id: CURRENT_USER.id, name: CURRENT_USER.name },
  },
  // Private message FROM the current viewer — should render for self as sender.
  {
    id: 'm6',
    authorId: CURRENT_USER.id,
    authorName: CURRENT_USER.name,
    avatarUrl: CURRENT_USER.avatarUrl,
    text: "Sure! I'll unmute and we can go back and forth.",
    timestamp: '10:07 AM',
    isSelf: true,
    privateTo: { id: 'u2', name: 'Anna K.' },
  },
  // Private message between two OTHER users — self is neither sender nor
  // recipient, so filterVisibleMessages below hides this from the demo view.
  {
    id: 'm7',
    authorId: 'u1',
    authorName: 'Sagar Hasan',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    text: 'Kenji, can you keep an eye on the queue while I grab water?',
    timestamp: '10:07 AM',
    privateTo: { id: 'u5', name: 'Kenji T.' },
  },
  {
    id: 'm8',
    authorId: CURRENT_USER.id,
    authorName: CURRENT_USER.name,
    avatarUrl: CURRENT_USER.avatarUrl,
    text: 'This is such a great group, thanks for having me 🙏',
    timestamp: '10:09 AM',
    isSelf: true,
  },
  // System notification example
  {
    id: 'm9',
    authorId: 'system',
    authorName: 'System',
    text: '🎉 Sarah M. has joined the chat room!',
    timestamp: '10:00 AM',
    isSystem: true,
    systemType: 'success',
  },
  {
    id: 'm10',
    authorId: 'system',
    authorName: 'System',
    text: '⚠️ Kenji T. is typing...',
    timestamp: '10:08 AM',
    isSystem: true,
    systemType: 'info',
  },
];

/**
 * A group chat can carry private (whisper) messages alongside public ones.
 * A message with `privateTo` set should only be visible to its sender and
 * its recipient — filter the full message list down to what `viewerId`
 * is actually allowed to see before rendering.
 */
export const filterVisibleMessages = (messages: ChatMessage[], viewerId: string): ChatMessage[] =>
  messages.filter(
    (m) =>
      // Always show system messages
      m.isSystem ||
      // Show regular messages if not private or user is involved
      !m.privateTo ||
      m.authorId === viewerId ||
      m.privateTo.id === viewerId
  );
