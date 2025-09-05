"use client";

import { useState, useEffect } from "react";
import SectionTitle from "../Common/SectionTitle";
import SingleBlog from "./SingleBlog";

interface Blog {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
  publishDate: string;
  author: {
    name: string;
  };
  tags: {
    name: string;
    slug: string;
    color: string;
  }[];
}

const Blog = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch('/api/blogs?published=true&limit=3');
        const data = await response.json();
        
        if (data.success) {
          setBlogs(data.data.blogs);
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section
        id="blog"
        className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
      >
        <div className="container">
          <SectionTitle
            title="Our Latest Blogs"
            paragraph="There are many variations of passages of Lorem Ipsum available but the majority have suffered alteration in some form."
            center
          />
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="blog"
      className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
    >
      <div className="container">
        <SectionTitle
          title="Our Latest Blogs"
          paragraph="There are many variations of passages of Lorem Ipsum available but the majority have suffered alteration in some form."
          center
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3">
          {blogs.map((blog) => (
            <div key={blog.id} className="w-full">
              <SingleBlog blog={blog} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
