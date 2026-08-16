import { environment } from '../../../../environments/environment';

export const SUPABASE_STORAGE_BASE = `${environment.supabase.url}/storage/v1/object/public/landing-assets/Solutions/`;

export interface Solution {
  icon: string;
  title: string;
  description: string;
  color: string;
  bg: string;
  headerBg?: string;
  mockupUrl: string;
}

export interface SolutionGroup {
  groupLabel: string;
  labelColor: string;
  bgClass: string;
  items: Solution[];
}


