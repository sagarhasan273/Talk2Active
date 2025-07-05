import type { Dispatch, SetStateAction } from 'react';

import type { IDateValue } from './common';

// ----------------------------------------------------------------------

export type IUserTableFilters = {
  name: string;
  role: string[];
  status: string;
};

export type IUserProfileCover = {
  name: string;
  role: string;
  userId: string;
  coverUrl: string;
  followers: number;
  friends: number;
  following: number;
  avatarUrl: string;
};

export type IUserProfile = {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePhoto: string;
  coverPhoto: string;
  bio: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  joinDate: IDateValue;
  lastActive: string;
  status: 'active' | 'inactive' | 'banned';
  verified: boolean;
  followersCount: number;
  followingCount: number;
  postCount: number;
  location: string;
  website: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
  password: string;
  createdAt: string;
  updatedAt: string;
  profileStatus: 'public' | 'private';
};

export type UserContextTypes = {
  user: IUserProfile | null;
  loading: boolean;
  setUser: Dispatch<SetStateAction<IUserProfile | null>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export type IUserProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IUserProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: IDateValue;
};

export type IUserProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

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

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserItem = {
  id: string;
  name: string;
  city: string;
  role: string;
  email: string;
  state: string;
  status: string;
  address: string;
  country: string;
  zipCode: string;
  company: string;
  avatarUrl: string;
  phoneNumber: string;
  isVerified: boolean;
};

export type IUserAccount = {
  city: string;
  email: string;
  state: string;
  about: string;
  address: string;
  zipCode: string;
  isPublic: boolean;
  displayName: string;
  phoneNumber: string;
  country: string | null;
  photoURL: File | string | null;
};

export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  invoiceNumber: string;
  createdAt: IDateValue;
};
