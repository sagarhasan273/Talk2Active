import type { IDateValue, ISocialLink } from './common';


// ----------------------------------------------------------------

export type IUserProfile = {
    id: string;
    role: string;
    quote: string;
    email: string;
    school: string;
    country: string;
    company: string;
    totalFollowers: number;
    totalFollowing: number;
    socialLinks: ISocialLink;
}

export type IUserProfilePost = {
    id: string;
    media: string;
    message: string;
    createdAt: IDateValue;
    personLikes: { name: string; avatarUrl: string }[];
    comments: {
      id: string;
      message: string;
      createdAt: IDateValue;
      author: { id: string; name: string; avatarUrl: string };
    }[];
  };
export type IUserProfileCover = {
    name: string;
    userId: string;
    role: string;
    coverUrl: string;
    avatarUrl: string;
    followers: number;
    friends: number;
    following: number;
};

