export interface User {
  _id: string;
  username: string;
  email: string;
  nativeLanguage: string;
  learningLanguages: LearningLanguage[];
  profile?: {
    bio?: string;
    avatar?: string;
  };
}

export interface LearningLanguage {
  language: string;
  level: string;
}

export interface Room {
  _id: string;
  name: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  tags: string[];
  host: User;
  currentParticipants: Participant[];
  maxParticipants: number;
  isActive: boolean;
  roomType: 'conversation' | 'pronunciation' | 'grammar';
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  user: User;
  joinedAt: string;
}

export interface CreateRoomData {
  name: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  tags: string[];
  maxParticipants: number;
  roomType: 'conversation' | 'pronunciation' | 'grammar';
}

export interface SocketUser {
  userId: string;
  socketId: string;
  userName: string;
}

export interface WebRTCOffer {
  target: string;
  offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswer {
  target: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidate {
  target: string;
  candidate: RTCIceCandidateInit;
}

export const initialRooms: Room[] = [
  {
    _id: '1',
    name: 'Spanish Conversation Circle',
    language: 'Spanish',
    level: 'intermediate',
    description:
      'Practice Spanish with native speakers and learners. We focus on everyday conversations and cultural exchange.',
    tags: ['conversation', 'culture', 'everyday-spanish'],
    host: {
      _id: '101',
      username: 'Maria Rodriguez',
      email: 'maria@email.com',
      nativeLanguage: 'Spanish',
      learningLanguages: [{ language: 'English', level: 'advanced' }],
      profile: {
        bio: 'Native Spanish speaker from Madrid',
        avatar: '',
      },
    },
    currentParticipants: [
      {
        user: {
          _id: '102',
          username: 'John Smith',
          email: 'john@email.com',
          nativeLanguage: 'English',
          learningLanguages: [{ language: 'Spanish', level: 'intermediate' }],
          profile: {
            bio: 'Language enthusiast from California',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '103',
          username: 'Carlos M',
          email: 'carlos@email.com',
          nativeLanguage: 'Spanish',
          learningLanguages: [{ language: 'English', level: 'beginner' }],
          profile: {
            bio: 'From Mexico City',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '104',
          username: 'Sarah Chen',
          email: 'sarah@email.com',
          nativeLanguage: 'Mandarin',
          learningLanguages: [
            { language: 'Spanish', level: 'intermediate' },
            { language: 'English', level: 'advanced' },
          ],
          profile: {
            bio: 'Polyglot from Taiwan',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '105',
          username: 'Alex Kim',
          email: 'alex@email.com',
          nativeLanguage: 'Korean',
          learningLanguages: [{ language: 'Spanish', level: 'beginner' }],
          profile: {
            bio: 'K-pop fan learning Spanish',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '106',
          username: 'Emma Wilson',
          email: 'emma@email.com',
          nativeLanguage: 'English',
          learningLanguages: [
            { language: 'Spanish', level: 'intermediate' },
            { language: 'French', level: 'beginner' },
          ],
          profile: {
            bio: 'Travel blogger',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '107',
          username: 'David Brown',
          email: 'david@email.com',
          nativeLanguage: 'English',
          learningLanguages: [{ language: 'Spanish', level: 'intermediate' }],
          profile: {
            bio: 'Business professional',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '108',
          username: 'Lisa Garcia',
          email: 'lisa@email.com',
          nativeLanguage: 'Spanish',
          learningLanguages: [{ language: 'English', level: 'advanced' }],
          profile: {
            bio: 'Language teacher from Barcelona',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '109',
          username: 'Mike Johnson',
          email: 'mike@email.com',
          nativeLanguage: 'English',
          learningLanguages: [{ language: 'Spanish', level: 'beginner' }],
          profile: {
            bio: 'Just starting my Spanish journey',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '110',
          username: 'Ana Silva',
          email: 'ana@email.com',
          nativeLanguage: 'Portuguese',
          learningLanguages: [
            { language: 'Spanish', level: 'intermediate' },
            { language: 'English', level: 'advanced' },
          ],
          profile: {
            bio: 'From Brazil, love languages',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '111',
          username: 'Tom Anderson',
          email: 'tom@email.com',
          nativeLanguage: 'English',
          learningLanguages: [{ language: 'Spanish', level: 'intermediate' }],
          profile: {
            bio: 'Digital nomad',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '112',
          username: 'Sofia Lopez',
          email: 'sofia@email.com',
          nativeLanguage: 'Spanish',
          learningLanguages: [{ language: 'English', level: 'intermediate' }],
          profile: {
            bio: 'University student',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '113',
          username: 'James Miller',
          email: 'james@email.com',
          nativeLanguage: 'English',
          learningLanguages: [{ language: 'Spanish', level: 'advanced' }],
          profile: {
            bio: 'Fluency seeker',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
      },
    ],
    maxParticipants: 14,
    isActive: true,
    roomType: 'conversation',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    name: 'French Pronunciation Lab',
    language: 'French',
    level: 'beginner',
    description:
      'Focus on French pronunciation with native speakers. Voice practice and phonetic exercises.',
    tags: ['pronunciation', 'phonetics', 'speaking'],
    host: {
      _id: '201',
      username: 'Pierre Dubois',
      email: 'pierre@email.com',
      nativeLanguage: 'French',
      learningLanguages: [{ language: 'English', level: 'advanced' }],
      profile: {
        bio: 'French language coach from Paris',
        avatar: '',
      },
    },
    currentParticipants: [
      {
        user: {
          _id: '202',
          username: 'John Voice',
          email: 'johnv@email.com',
          nativeLanguage: 'English',
          learningLanguages: [{ language: 'French', level: 'beginner' }],
          profile: {
            bio: 'Learning French for travel',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
    ],
    maxParticipants: 6,
    isActive: true,
    roomType: 'pronunciation',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    name: 'English Grammar Workshop',
    language: 'English',
    level: 'advanced',
    description:
      'Intensive grammar practice with AI assistance. Perfect for intermediate to advanced learners.',
    tags: ['grammar', 'writing', 'academic-english'],
    host: {
      _id: '301',
      username: 'Dr. Emily Chen',
      email: 'emily@email.com',
      nativeLanguage: 'English',
      learningLanguages: [{ language: 'Mandarin', level: 'intermediate' }],
      profile: {
        bio: 'English professor and linguist',
        avatar: '',
      },
    },
    currentParticipants: [
      {
        user: {
          _id: '302',
          username: 'Yuki Tanaka',
          email: 'yuki@email.com',
          nativeLanguage: 'Japanese',
          learningLanguages: [{ language: 'English', level: 'advanced' }],
          profile: {
            bio: 'Preparing for IELTS exam',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '303',
          username: 'Wei Zhang',
          email: 'wei@email.com',
          nativeLanguage: 'Mandarin',
          learningLanguages: [{ language: 'English', level: 'advanced' }],
          profile: {
            bio: 'Business professional',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      },
      {
        user: {
          _id: '304',
          username: 'John Voice',
          email: 'johnv@email.com',
          nativeLanguage: 'English',
          learningLanguages: [{ language: 'French', level: 'beginner' }],
          profile: {
            bio: 'Learning French for travel',
            avatar: '',
          },
        },
        joinedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
    ],
    maxParticipants: 8,
    isActive: true,
    roomType: 'grammar',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
];
