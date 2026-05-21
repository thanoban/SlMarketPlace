import type { EventStatus, EventMode, UserRole } from "@/lib/constants";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  homeDistrict?: string;
  interests?: string[];
  onboardingComplete: boolean;
  createdAt: Date;
}

export interface IClub {
  _id: string;
  userId: string;
  name: string;
  logoUrl?: string;
  description: string;
  contact: string;
  district: string;
  isVerified: boolean;
  createdAt: Date;
}

export interface IInterest {
  _id: string;
  name: string;
}

export interface IEvent {
  _id: string;
  clubId: string | IClub;
  title: string;
  description: string;
  bannerUrl?: string;
  mode: EventMode;
  district?: string;
  venue?: string;
  onlineLink?: string;
  startDatetime: Date | string;
  endDatetime: Date | string;
  goLiveAt: Date | string;
  status: EventStatus;
  rejectReason?: string;
  isPromoted: boolean;
  interests: string[] | IInterest[];
  createdAt: Date;
}

export interface ISavedEvent {
  _id: string;
  userId: string;
  eventId: string | IEvent;
  createdAt: Date;
}

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    role: string;
    onboardingComplete: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      onboardingComplete: boolean;
    };
  }
}

