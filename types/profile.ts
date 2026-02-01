export interface Profile {
  id: string;
  fullName: string;
  email: string;
  age: number;
  city: string;
  state: string;
  country: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DraftProfile = Partial<Profile>;

export interface ProfileFormData {
  fullName: string;
  email: string;
  age: string;
  city: string;
  state: string;
  country: string;
  avatar?: string;
}

export interface ValidationErrors {
  fullName?: string;
  email?: string;
  age?: string;
  city?: string;
  state?: string;
  country?: string;
}