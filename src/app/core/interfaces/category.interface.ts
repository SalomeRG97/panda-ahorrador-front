export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  user_id?: number | null;
  isGlobal?: boolean;
}

