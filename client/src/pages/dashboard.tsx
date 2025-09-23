import { Card, CardContent } from "@/components/ui/card";
import { Book, Users, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";

interface DashboardStats {
  totalBooks: number;
  uniqueAuthors: number;
  todayBooks: number;
  uniqueISBNs: number;
  frequentAuthors: Array<{ author: string; count: number }>;
  recentBooks: Array<{
    id: string;
    name: string;
    author: string;
    isbn: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/books/stats'],
  });

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    bgColor 
  }: { 
    icon: any; 
    title: string; 
    value: number | string; 
    bgColor: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {isLoading ? "..." : value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-dashboard-title">
            Dashboard
          </h2>
          <p className="text-muted-foreground" data-testid="text-dashboard-subtitle">
            Visão geral do seu acervo de livros
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Book}
            title="Total de Livros"
            value={stats?.totalBooks || 0}
            bgColor="bg-primary"
          />
          <StatCard
            icon={Users}
            title="Autores Únicos"
            value={stats?.uniqueAuthors || 0}
            bgColor="bg-accent"
          />
          <StatCard
            icon={Calendar}
            title="Adicionados Hoje"
            value={stats?.todayBooks || 0}
            bgColor="bg-secondary"
          />
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-recent-books-title">
              Últimos Livros Adicionados
            </h3>
            <div className="space-y-3" data-testid="list-recent-books">
              {isLoading ? (
                <p className="text-muted-foreground">Carregando...</p>
              ) : !stats?.recentBooks || stats.recentBooks.length === 0 ? (
                <p className="text-muted-foreground">Nenhum livro cadastrado ainda.</p>
              ) : (
                stats.recentBooks.map((book) => (
                  <div key={book.id} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`recent-book-${book.id}`}>
                    <div>
                      <p className="font-medium text-foreground">{book.name}</p>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{book.isbn}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
