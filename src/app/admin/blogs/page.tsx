"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { blogsAPI, BlogList } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminBlogsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [blogs, setBlogs] = useState<BlogList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "regular">("all");

  const blogsPerPage = 10;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/admin/login');
      return;
    }
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchBlogs();
    }
  }, [isLoading, isAuthenticated, user, currentPage, searchTerm, statusFilter, featuredFilter]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getBlogs({
        skip: (currentPage - 1) * blogsPerPage,
        limit: blogsPerPage,
        search: searchTerm || undefined,
        published: statusFilter === "all" ? undefined : statusFilter === "published",
        featured: featuredFilter === "all" ? undefined : featuredFilter === "featured",
      });
      
      setBlogs(response.blogs);
      setTotalBlogs(response.total);
    } catch (error: any) {
      toast.error("Failed to fetch blogs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      await blogsAPI.deleteBlog(blogId);
      toast.success("Blog deleted successfully");
      fetchBlogs();
      setSelectedBlogs(selectedBlogs.filter(id => id !== blogId));
    } catch (error: any) {
      toast.error("Failed to delete blog: " + error.message);
    }
  };

  const handleTogglePublished = async (blog: BlogList) => {
    try {
      await blogsAPI.updateBlog(blog.id, {
        published: !blog.published
      });
      toast.success(`Blog ${blog.published ? 'unpublished' : 'published'} successfully`);
      fetchBlogs();
    } catch (error: any) {
      toast.error("Failed to update blog: " + error.message);
    }
  };

  const handleToggleFeatured = async (blog: BlogList) => {
    try {
      await blogsAPI.updateBlog(blog.id, {
        featured: !blog.featured
      });
      toast.success(`Blog ${blog.featured ? 'removed from featured' : 'added to featured'} successfully`);
      fetchBlogs();
    } catch (error: any) {
      toast.error("Failed to update blog: " + error.message);
    }
  };

  const totalPages = Math.ceil(totalBlogs / blogsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Blog Management
        </h1>
        <button
          onClick={() => router.push('/admin/blogs/create')}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium"
        >
          Create New Blog
        </button>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search blogs..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as typeof statusFilter);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured
            </label>
            <select
              value={featuredFilter}
              onChange={(e) => {
                setFeaturedFilter(e.target.value as typeof featuredFilter);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Blogs</option>
              <option value="featured">Featured</option>
              <option value="regular">Regular</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setFeaturedFilter("all");
                setCurrentPage(1);
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBlogs.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedBlogs.length} blogs selected
            </span>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${selectedBlogs.length} blogs?`)) {
                  Promise.all(selectedBlogs.map(id => blogsAPI.deleteBlog(id)))
                    .then(() => {
                      toast.success(`${selectedBlogs.length} blogs deleted successfully`);
                      setSelectedBlogs([]);
                      fetchBlogs();
                    })
                    .catch((error) => {
                      toast.error("Failed to delete blogs: " + error.message);
                    });
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {blogs.length} of {totalBlogs} blogs
      </div>

      {/* Blogs Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBlogs(blogs.map(blog => blog.id));
                    } else {
                      setSelectedBlogs([]);
                    }
                  }}
                  checked={selectedBlogs.length === blogs.length && blogs.length > 0}
                  className="w-4 h-4 text-blue-600"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Published
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {blogs.map((blog) => (
              <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedBlogs.includes(blog.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBlogs([...selectedBlogs, blog.id]);
                      } else {
                        setSelectedBlogs(selectedBlogs.filter(id => id !== blog.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/placeholder-blog.jpg';
                      }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {blog.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {blog.excerpt}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {blog.author.name || blog.author.email}
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleTogglePublished(blog)}
                    className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-75 ${
                      blog.published
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {blog.published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    onClick={() => handleToggleFeatured(blog)}
                    className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-75 ${
                      blog.featured
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {blog.featured ? "Featured" : "Regular"}
                  </button>
                </td>
                <td className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {blog.views}
                </td>
                <td className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(blog.publish_date)}
                </td>
                <td className="px-4 py-4 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => router.push(`/admin/blogs/edit/${blog.id}`)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {blogs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No blogs found. {searchTerm ? "Try adjusting your search or filters." : "Create your first blog!"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-md ${
                  currentPage === page
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
