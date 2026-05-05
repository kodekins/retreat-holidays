import Header from "@/components/Header";
import DetailedFooter from "@/components/DetailedFooter";
import { Link, useParams } from "react-router-dom";
import { blogPosts } from "@/content/blog/posts";
import { Calendar, ArrowLeft } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug && p.lang === "en");

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold mb-2">Post not found</div>
          <Link to="/blog" className="text-primary underline hover:text-primary/90">
            Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <Link to="/blog" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Back to blog
              </Link>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{post.title}</h1>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mb-8">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              {post.country ? <span className="text-primary">• {post.country}</span> : null}
            </div>

            <article
              className="prose prose-neutral max-w-none prose-headings:font-display prose-a:text-primary"
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />
          </div>
        </div>
      </main>

      <DetailedFooter />
    </div>
  );
};

export default BlogPost;

