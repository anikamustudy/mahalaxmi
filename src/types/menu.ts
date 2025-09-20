



export type Menu = {
  id: string;  // Changed from number to string to match UUID
  title: string;
  path?: string;
  newTab: boolean;
  order: number;
  children?: Menu[];
  created_at?: string;  // Optional ISO string
  updated_at?: string;  // Optional ISO string
};