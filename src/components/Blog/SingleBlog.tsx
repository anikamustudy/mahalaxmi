


// import Image from "next/image";
// import Link from "next/link";

// interface BlogProps {
//   blog: {
//     id: string;
//     title: string;
//     excerpt: string;
//     image: string;
//     slug: string;
//     publishDate: string;
//     author: {
//       name: string;
//       image?: string; // Optional author image
//     };
//     tags: {
//       name: string;
//       slug: string;
//       color: string;
//     }[];
//   };
// }

// const SingleBlog = ({ blog }: BlogProps) => {
//   const { title, image, excerpt, author, tags, publishDate, slug } = blog;
//   const formattedDate = publishDate
//     ? new Date(publishDate).toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       })
//     : "Unknown Date";

//   return (
//     <div className="group shadow-one hover:shadow-two dark:bg-dark dark:hover:shadow-gray-dark relative overflow-hidden rounded-xs bg-white duration-300">
//       <Link
//         href={`/blog/${slug}`}
//         className="relative block aspect-37/22 w-full"
//         aria-label={`Read more about ${title}`}
//       >
//         {tags?.length > 0 && (
//           <span
//             className="absolute top-6 right-6 z-20 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white capitalize"
//             style={{ backgroundColor: tags[0]?.color || "#3B82F6" }}
//           >
//             {tags[0]?.name || "Uncategorized"}
//           </span>
//         )}
//         <Image
//           src={image || "/fallback-image.jpg"}
//           alt={title || "Blog post image"}
//           fill
//           className="object-cover"
//         />
//       </Link>
//       <div className="p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8">
//         <h3>
//           <Link
//             href={`/blog/${slug}`}
//             className="hover:text-primary dark:hover:text-primary mb-4 block text-xl font-bold text-black sm:text-2xl dark:text-white"
//           >
//             {title}
//           </Link>
//         </h3>
//         <p className="border-body-color/10 text-body-color mb-6 border-b pb-6 text-base font-medium dark:border-white/10">
//           {excerpt}
//         </p>
//         <div className="flex items-center">
//           <div className="border-body-color/10 mr-5 flex items-center border-r pr-5 xl:mr-3 xl:pr-3 2xl:mr-5 2xl:pr-5 dark:border-white/10">
//             <div className="mr-4">
//               <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
//                 {author?.image ? (
//                   <Image
//                     src={author.image}
//                     alt={author?.name || "Author"}
//                     fill
//                     className="object-cover"
//                   />
//                 ) : (
//                   <span className="text-gray-600 font-semibold text-sm">
//                     {author?.name?.charAt(0).toUpperCase() || "?"}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <div className="w-full">
//               <h4 className="text-dark mb-1 text-sm font-medium dark:text-white">
//                 By {author?.name || "Anonymous"}
//               </h4>
//               <p className="text-body-color text-xs">Author</p>
//             </div>
//           </div>
//           <div className="inline-block">
//             <h4 className="text-dark mb-1 text-sm font-medium dark:text-white">
//               Date
//             </h4>
//             <p className="text-body-color text-xs">{formattedDate}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SingleBlog;



import Image from "next/image";
import Link from "next/link";

interface BlogProps {
  blog: {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    slug: string;
    publishDate: string;
    author: {
      name: string;
      image?: string; // Optional author image
      designation?: string; // Optional designation
    };
    tags: {
      name: string;
      slug: string;
      color: string;
    }[];
  };
}

const SingleBlog = ({ blog }: BlogProps) => {
  const { title, image, excerpt, author, tags, publishDate, slug } = blog;
  const formattedDate = publishDate
    ? new Date(publishDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown Date";

  return (
    <div className="group shadow-one hover:shadow-two dark:bg-dark dark:hover:shadow-gray-dark relative overflow-hidden rounded-xs bg-white duration-300">
      <Link
        href={`/blog/${slug}`}
        className="relative block aspect-[37/22] w-full" // Define aspect ratio
        aria-label={`Read more about ${title}`}
      >
        {tags?.length > 0 && (
          <span
            className="absolute top-6 right-6 z-20 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white capitalize"
            style={{ backgroundColor: tags[0]?.color || "#3B82F6" }}
          >
            {tags[0]?.name || "Uncategorized"}
          </span>
        )}
        <Image
          src={image || "/images/fallback-image.jpg"} // Ensure fallback exists in public/
          alt={title || "Blog post image"}
          fill // Use fill with aspect ratio defined above
          className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          sizes="(max-width: 768px) 100vw, 33vw" // Optimize for responsive images
        />
      </Link>
      <div className="p-6 sm:p-8 md:px-6 md:py-8 lg:p-8 xl:px-5 xl:py-8 2xl:p-8">
        <h3>
          <Link
            href={`/blog/${slug}`}
            className="hover:text-primary dark:hover:text-primary mb-4 block text-xl font-bold text-black sm:text-2xl dark:text-white"
          >
            {title}
          </Link>
        </h3>
        <p className="border-body-color/10 text-body-color mb-6 border-b pb-6 text-base font-medium dark:border-white/10">
          {excerpt}
        </p>
        <div className="flex items-center">
          <div className="border-body-color/10 mr-5 flex items-center border-r pr-5 xl:mr-3 xl:pr-3 2xl:mr-5 2xl:pr-5 dark:border-white/10">
            <div className="mr-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                {author?.image ? (
                  <Image
                    src={author.image}
                    alt={author?.name || "Author"}
                    width={40} // Fixed size for author image
                    height={40}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-semibold text-sm">
                    {author?.name?.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </div>
            </div>
            <div className="w-full">
              <h4 className="text-dark mb-1 text-sm font-medium dark:text-white">
                By {author?.name || "Anonymous"}
              </h4>
              {author?.designation && (
                <p className="text-body-color text-xs">{author.designation}</p>
              )}
            </div>
          </div>
          <div className="inline-block">
            <h4 className="text-dark mb-1 text-sm font-medium dark:text-white">
              Date
            </h4>
            <p className="text-body-color text-xs">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleBlog;