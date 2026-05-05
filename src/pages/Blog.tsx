import Header from "@/components/Header";
import DetailedFooter from "@/components/DetailedFooter";
import { Link } from "react-router-dom";
import { blogPosts } from "@/content/blog/posts";
import { Calendar, ArrowRight } from "lucide-react";

const Blog = () => {
  const posts = blogPosts
    .filter((p) => p.lang === "en")
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Retreats Holidays Blog
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              SEO guides for GCC travelers: wellness retreats by country, planning checklists, and how to choose the
              right retreat.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all group"
                >
                  <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(p.publishedAt).toLocaleDateString()}</span>
                    {p.country ? <span className="text-primary">• {p.country}</span> : null}
                  </div>
                  <div className="font-display text-2xl font-bold text-foreground mb-2">{p.title}</div>
                  <div className="text-muted-foreground leading-relaxed mb-4">{p.description}</div>
                  <div className="text-primary font-semibold inline-flex items-center gap-2">
                    Read more{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <DetailedFooter />
    </div>
  );
};

export default Blog;

