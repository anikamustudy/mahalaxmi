const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  slug: string;
  published: boolean;
  featured: boolean;
  views: number;
  publish_date: string;
  author: User;
  tags: Tag[];
}

export interface BlogList {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  published: boolean;
  featured: boolean;
  views: number;
  publish_date: string;
  author: User;
  tags: Tag[];
}

export interface BlogsResponse {
  blogs: BlogList[];
  total: number;
  skip: number;
  limit: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  published: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  designation: string;
  company: string | null;
  image: string;
  content: string;
  rating: number;
  featured: boolean;
  order: number;
}

export interface MenuItem {
  id: string;
  title: string;
  path: string | null;
  new_tab: boolean;
  order: number;
  children: MenuItem[];
}

export interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_email: string;
  approved: boolean;
  created_at: string;
  blog_id: string;
}

// Utility function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic fetch function
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Network error' }));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Authentication API
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (email: string, password: string, name?: string): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role: 'USER' }),
    });
  },

  adminLogin: async (email: string, password: string): Promise<LoginResponse> => {
    return apiFetch<LoginResponse>('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiFetch<User>('/api/auth/me');
  },

  logout: async (): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },
};

// Blogs API
export const blogsAPI = {
  getBlogs: async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    featured?: boolean;
    published?: boolean;
    tag?: string;
  }): Promise<BlogsResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    return apiFetch<BlogsResponse>(`/api/blogs${queryString ? `?${queryString}` : ''}`);
  },

  getFeaturedBlogs: async (limit = 3): Promise<BlogList[]> => {
    return apiFetch<BlogList[]>(`/api/blogs/featured?limit=${limit}`);
  },

  getBlogBySlug: async (slug: string): Promise<Blog> => {
    return apiFetch<Blog>(`/api/blogs/${slug}`);
  },

  createBlog: async (blogData: {
    title: string;
    content: string;
    excerpt: string;
    image: string;
    slug: string;
    published?: boolean;
    featured?: boolean;
    author_id: string;
    tag_ids?: string[];
  }): Promise<Blog> => {
    return apiFetch<Blog>('/api/blogs/', {
      method: 'POST',
      body: JSON.stringify(blogData),
    });
  },

  updateBlog: async (blogId: string, blogData: Partial<{
    title: string;
    content: string;
    excerpt: string;
    image: string;
    slug: string;
    published: boolean;
    featured: boolean;
    tag_ids: string[];
  }>): Promise<Blog> => {
    return apiFetch<Blog>(`/api/blogs/${blogId}`, {
      method: 'PUT',
      body: JSON.stringify(blogData),
    });
  },

  deleteBlog: async (blogId: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/blogs/${blogId}`, {
      method: 'DELETE',
    });
  },

  getBlogComments: async (blogId: string, approvedOnly = true): Promise<Comment[]> => {
    return apiFetch<Comment[]>(`/api/blogs/${blogId}/comments?approved_only=${approvedOnly}`);
  },

  createComment: async (blogId: string, commentData: {
    content: string;
    author_name: string;
    author_email: string;
  }): Promise<Comment> => {
    return apiFetch<Comment>(`/api/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },
};

// Features API
export const featuresAPI = {
  getFeatures: async (publishedOnly = true): Promise<Feature[]> => {
    return apiFetch<Feature[]>(`/api/features?published_only=${publishedOnly}`);
  },
};

// Testimonials API
export const testimonialsAPI = {
  getTestimonials: async (publishedOnly = true, featuredOnly = false): Promise<Testimonial[]> => {
    return apiFetch<Testimonial[]>(
      `/api/testimonials?published_only=${publishedOnly}&featured_only=${featuredOnly}`
    );
  },
};

// Navbar API
export const navbarAPI = {
  getMenuItems: async (): Promise<MenuItem[]> => {
    return apiFetch<MenuItem[]>('/api/navbar/menu');
  },

  // Admin menu management
  getAllMenuItems: async (includeUnpublished = false): Promise<MenuItem[]> => {
    return apiFetch<MenuItem[]>(`/api/navbar/admin/menu?include_unpublished=${includeUnpublished}`);
  },

  createMenuItem: async (menuData: {
    title: string;
    path?: string;
    new_tab?: boolean;
    order?: number;
    published?: boolean;
    parent_id?: string;
  }): Promise<MenuItem> => {
    return apiFetch<MenuItem>('/api/navbar/menu', {
      method: 'POST',
      body: JSON.stringify(menuData),
    });
  },

  updateMenuItem: async (itemId: string, menuData: {
    title?: string;
    path?: string;
    new_tab?: boolean;
    order?: number;
    published?: boolean;
    parent_id?: string;
  }): Promise<MenuItem> => {
    return apiFetch<MenuItem>(`/api/navbar/menu/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(menuData),
    });
  },

  deleteMenuItem: async (itemId: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/api/navbar/menu/${itemId}`, {
      method: 'DELETE',
    });
  },

  reorderMenuItems: async (itemOrders: Array<{
    id: string;
    order: number;
    parent_id?: string;
  }>): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/api/navbar/admin/menu/reorder', {
      method: 'POST',
      body: JSON.stringify(itemOrders),
    });
  },

  bulkMenuAction: async (itemIds: string[], action: 'publish' | 'unpublish' | 'delete'): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/api/navbar/admin/menu/bulk-action', {
      method: 'POST',
      body: JSON.stringify({ item_ids: itemIds, action }),
    });
  },
};





// Contact API
export const contactAPI = {
  submitContactForm: async (contactData: {
    name: string;
    email: string;
    subject?: string;
    message: string;
  }): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/api/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },
};

// Newsletter API
export const newsletterAPI = {
  subscribe: async (email: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/api/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  unsubscribe: async (email: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/api/newsletter/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};
