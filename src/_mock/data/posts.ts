import type { Post } from 'src/types/post';

export const initialPosts: Post[] = [
  {
    id: '1',
    content:
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
    author: {
      name: 'Alex Rivera',
      username: 'alexr',
      avatar:
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    timestamp: new Date('2024-01-15T10:30:00'),
    likes: 42,
    reposts: 12,
    comments: [
      {
        id: 'c1',
        content: 'This really resonates with me. Thanks for sharing!',
        author: { name: 'Sam Chen', username: 'samchen' },
        timestamp: new Date('2024-01-15T11:15:00'),
      },
    ],
    isLiked: false,
    isReposted: false,
  },
  {
    id: '2',
    content:
      'Innovation distinguishes between a leader and a follower. The courage to think differently is what sets great minds apart.',
    author: {
      name: 'Jordan Blake',
      username: 'jordanb',
      avatar:
        'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    timestamp: new Date('2024-01-15T09:45:00'),
    likes: 78,
    reposts: 23,
    comments: [],
    isLiked: true,
    isReposted: false,
  },
  {
    id: '3',
    content:
      'The best time to plant a tree was 20 years ago. The second best time is now. Every moment is a new beginning.',
    author: {
      name: 'Maya Patel',
      username: 'mayap',
      avatar:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    timestamp: new Date('2024-01-15T08:20:00'),
    likes: 156,
    reposts: 45,
    comments: [
      {
        id: 'c2',
        content: 'Beautiful wisdom!',
        author: { name: 'David Kim', username: 'davidkim' },
        timestamp: new Date('2024-01-15T08:45:00'),
      },
      {
        id: 'c3',
        content: 'Exactly what I needed to hear today.',
        author: { name: 'Emma Wilson', username: 'emmaw' },
        timestamp: new Date('2024-01-15T09:10:00'),
      },
    ],
    isLiked: false,
    isReposted: true,
  },
  {
    id: '4',
    content:
      'Success is not final, failure is not fatal: it is the courage to continue that counts.',
    author: {
      name: 'Sarah Johnson',
      username: 'sarahj',
      avatar:
        'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    },
    timestamp: new Date('2024-01-14T16:20:00'),
    likes: 89,
    reposts: 34,
    comments: [],
    isLiked: false,
    isReposted: false,
    repostedBy: {
      name: 'You',
      username: 'youruser',
      timestamp: new Date('2024-01-15T12:30:00'),
    },
  },
];
