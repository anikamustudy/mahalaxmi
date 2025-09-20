// import SingleBlog from "@/components/Blog/SingleBlog";
// import blogData from "@/components/Blog/blogData";
// import Breadcrumb from "@/components/Common/Breadcrumb";

// import { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "Blog Page | Free Next.js Template for Startup and SaaS",
//   description: "This is Blog Page for Startup Nextjs Template",
//   // other metadata
// };

// const Blog = () => {
//   return (
//     <>
//       <Breadcrumb
//         pageName="Blog Grid"
//         description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius eros eget sapien consectetur ultrices. Ut quis dapibus libero."
//       />

//       <section className="pt-[120px] pb-[120px]">
//         <div className="container">
//           <div className="-mx-4 flex flex-wrap justify-center">
//             {blogData.map((blog) => (
//               <div
//                 key={blog.id}
//                 className="w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3"
//               >
//                 <SingleBlog blog={blog} />
//               </div>
//             ))}
//           </div>

//           <div className="-mx-4 flex flex-wrap" data-wow-delay=".15s">
//             <div className="w-full px-4">
//               <ul className="flex items-center justify-center pt-8">
//                 <li className="mx-1">
//                   <a
//                     href="#0"
//                     className="bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white"
//                   >
//                     Prev
//                   </a>
//                 </li>
//                 <li className="mx-1">
//                   <a
//                     href="#0"
//                     className="bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white"
//                   >
//                     1
//                   </a>
//                 </li>
//                 <li className="mx-1">
//                   <a
//                     href="#0"
//                     className="bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white"
//                   >
//                     2
//                   </a>
//                 </li>
//                 <li className="mx-1">
//                   <a
//                     href="#0"
//                     className="bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white"
//                   >
//                     3
//                   </a>
//                 </li>
//                 <li className="mx-1">
//                   <span className="bg-body-color/15 text-body-color flex h-9 min-w-[36px] cursor-not-allowed items-center justify-center rounded-md px-4 text-sm">
//                     ...
//                   </span>
//                 </li>
//                 <li className="mx-1">
//                   <a
//                     href="#0"
//                     className="bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white"
//                   >
//                     12
//                   </a>
//                 </li>
//                 <li className="mx-1">
//                   <a
//                     href="#0"
//                     className="bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white"
//                   >
//                     Next
//                   </a>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// };

// export default Blog;



import SingleBlog from "@/components/Blog/SingleBlog";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useState, useEffect } from "react";
import { blogsAPI } from "@/lib/api"; // Import the blogsAPI from your api.ts
import { BlogList } from "@/lib/api"; // Import the BlogList type from api.ts

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Page | Free Next.js Template for Startup and SaaS",
  description: "This is Blog Page for Startup Nextjs Template",
  // other metadata
};

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogList[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const blogsPerPage = 6; // Adjust based on your layout (3 per row x 2 rows)

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await blogsAPI.getBlogs({
          skip: (currentPage - 1) * blogsPerPage,
          limit: blogsPerPage,
          published: true,
        });
        setBlogs(response.blogs);
        setTotalPages(Math.ceil(response.total / blogsPerPage));
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb
        pageName="Blog Grid"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. In varius eros eget sapien consectetur ultrices. Ut quis dapibus libero."
      />

      <section className="pt-[120px] pb-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap justify-center">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="w-full px-4 md:w-2/3 lg:w-1/2 xl:w-1/3 mb-8" // Added mb-8 for spacing
              >
                <SingleBlog
                  blog={{
                    id: blog.id,
                    title: blog.title,
                    excerpt: blog.excerpt,
                    image: blog.image,
                    slug: blog.slug,
                    publishDate: blog.publish_date, // Match API field name
                    author: {
                      name: blog.author.name,
                      image: blog.author.image || undefined, // Handle optional image
                    },
                    tags: blog.tags.map((tag) => ({
                      name: tag.name,
                      slug: tag.slug,
                      color: tag.color,
                    })),
                  }}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="-mx-4 flex flex-wrap" data-wow-delay=".15s">
            <div className="w-full px-4">
              <ul className="flex items-center justify-center pt-8">
                <li className="mx-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li key={page} className="mx-1">
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white ${
                          currentPage === page ? "bg-primary text-white" : ""
                        }`}
                      >
                        {page}
                      </button>
                    </li>
                  )
                )}
                {totalPages > 3 && (
                  <li className="mx-1">
                    <span className="bg-body-color/15 text-body-color flex h-9 min-w-[36px] cursor-not-allowed items-center justify-center rounded-md px-4 text-sm">
                      ...
                    </span>
                  </li>
                )}
                <li className="mx-1">
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-body-color/15 text-body-color hover:bg-primary flex h-9 min-w-[36px] items-center justify-center rounded-md px-4 text-sm transition hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Blog;