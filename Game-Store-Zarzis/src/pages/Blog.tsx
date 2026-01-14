import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo } from 'react';

import SEO from '@/components/SEO';

const Blog = () => {
  const { blogPosts } = useData();

  const publishedPosts = blogPosts.filter(post => post.is_published);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Blog"
        description="Découvrez nos derniers articles sur les réparations, le gaming et les actualités du store à Zarzis."
      />
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Game Store
              <span className="text-gradient"> Blog</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with our latest repairs, services, and gaming tips
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {publishedPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p>Check back soon for updates on repairs and services!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedPosts.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                {post.image_url && (
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.category && (
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.content}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Staff</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Blog);
