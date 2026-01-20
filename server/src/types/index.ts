import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  role: string;
  created_at: Date;
}

export interface DevflixInstance {
  id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  header_links: unknown[];
  initial_banner: Record<string, unknown>;
  countdown_banner: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface ClassItem {
  id: number;
  instance_id: string;
  class_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  is_available: boolean;
  scheduled_release: Date | null;
  released_at: Date | null;
  order_index: number;
}

export interface Material {
  id: number;
  instance_id: string;
  class_id: string;
  item_id: string;
  title: string;
  url: string | null;
  type: string;
  locked: boolean;
  scheduled_unlock: Date | null;
  unlocked_at: Date | null;
  order_index: number;
}

export interface Schedule {
  id: number;
  instance_id: string;
  day_number: number;
  title: string;
  description: string | null;
  date: Date | null;
  time: string | null;
  is_active: boolean;
}

export interface MaterialItem {
  id: string;
  title: string;
  url?: string;
  type?: string;
  locked?: boolean;
  scheduledUnlock?: string | null;
  unlockedAt?: string | null;
}

export interface MaterialGroup {
  classId: string;
  items: MaterialItem[];
}
