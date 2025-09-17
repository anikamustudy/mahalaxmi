"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  blogs: number;
  contacts: number;
  newsletters: number;
  testimonials: number;
  features: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    blogs: 0,
    contacts: 0,
    newsletters: 0,
    testimonials: 0,
    features: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success && data.data.user.role === "ADMIN") {
          setUser(data.data.user);
          fetchStats(token);
        } else {
          localStorage.removeItem("adminToken");
          router.push("/admin/login");
        }
      } catch (error) {
        localStorage.removeItem("adminToken");
        router.push("/admin/login");
      }
    };

    checkAuth();
  }, [router]);

  const fetchStats = async (token: string) => {
    try {
      const [blogsRes, contactsRes, newslettersRes, testimonialsRes, featuresRes] = await Promise.all([
        fetch("/api/blogs", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/contact", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/newsletter", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/testimonials", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/features", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [blogs, contacts, newsletters, testimonials, features] = await Promise.all([
        blogsRes.json(),
        contactsRes.json(),
        newslettersRes.json(),
        testimonialsRes.json(),
        featuresRes.json(),
      ]);

      setStats({
        blogs: blogs.success ? blogs.data.totalCount || blogs.data.blogs?.length || 0 : 0,
        contacts: contacts.success ? contacts.data.totalCount || contacts.data.contacts?.length || 0 : 0,
        newsletters: newsletters.success ? newsletters.data.totalCount || newsletters.data.subscribers?.length || 0 : 0,
        testimonials: testimonials.success ? testimonials.data.length || 0 : 0,
        features: features.success ? features.data.length || 0 : 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-300">
                Welcome, {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📝</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Blog Posts
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.blogs}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📧</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Contact Messages
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.contacts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📰</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Newsletter Subscribers
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.newsletters}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">💬</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Testimonials
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.testimonials}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">⭐</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Features
                      </dt>
                      <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.features}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                <li>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Manage Content
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Create, edit, and manage your website content
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href="/admin/blogs"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Blogs
                        </a>
                        <a
                          href="/admin/menu"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Menu
                        </a>
                        <a
                          href="/admin/contacts"
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Messages
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          Website Settings
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Configure site settings and preferences
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href="/"
                          target="_blank"
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                          View Site
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* API Information */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              API Information
            </h2>
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Your website is now powered by a dynamic API. Here are the available endpoints:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">GET /api/blogs</code> - Fetch blog posts</li>
                  <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/contact</code> - Submit contact form</li>
                  <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">POST /api/newsletter</code> - Subscribe to newsletter</li>
                  <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">GET /api/testimonials</code> - Fetch testimonials</li>
                  <li>• <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">GET /api/features</code> - Fetch features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
