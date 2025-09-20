


type Author = {
  name: string;
  image: string;
  designation?: string; // Optional to match both static and API data
};

export type Blog = {
  id: string; // Changed from number to string
  title: string;
  paragraph: string; // Renamed to excerpt for consistency with API
  excerpt: string; // Added for consistency with SingleBlog.tsx
  image: string;
  author: Author;
  tags: string[]; // Changed to string[] to match blogData.tsx, or use { name: string; slug: string; color: string }[] for API
  publishDate: string;
};