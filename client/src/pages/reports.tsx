import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { type Book } from "@shared/schema";

interface DashboardStats {
  totalBooks: number;
  uniqueAuthors: number;
  uniqueISBNs: number;
  frequentAuthors: Array<{ author: string; count: number }>;
}

export default function Reports() {
  const { toast } = useToast();

  const { data: books = [], isLoading: booksLoading } = useQuery<Book[]>({
    queryKey: ['/api/books'],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/books/stats'],
  });

  const handleExport = () => {
    if (books.length === 0) {
      toast({
        title: "Nenhum livro para exportar",
        description: "Cadastre alguns livros primeiro.",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      ['Nome do Livro', 'Autor', 'ISBN', 'Data de Cadastro'],
      ...books.map(book => [
        book.name,
        book.author,
        book.isbn,
        new Date(book.createdAt).toLocaleDateString('pt-BR')
      ])
    ]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `spiritus_lectoris_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Relatório exportado com sucesso!",
      description: "O arquivo CSV foi baixado."
    });
  };

  return (
    <Layout>
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-reports-title">
            Relatórios
          </h2>
          <p className="text-muted-foreground" data-testid="text-reports-subtitle">
            Visualize e exporte informações do seu acervo
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground" data-testid="text-books-list-title">
                    Lista Completa de Livros
                  </h3>
                  <Button 
                    variant="secondary"
                    onClick={handleExport}
                    size="sm"
                    data-testid="button-export"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Autor</TableHead>
                      <TableHead>ISBN</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-testid="table-reports">
                    {booksLoading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : books.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Nenhum livro cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      books.map((book) => (
                        <TableRow key={book.id} data-testid={`report-book-${book.id}`}>
                          <TableCell className="font-medium">{book.name}</TableCell>
                          <TableCell className="text-muted-foreground">{book.author}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">{book.isbn}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-statistics-title">
                  Estatísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de Livros:</span>
                    <span className="font-medium text-foreground" data-testid="stat-total-books">
                      {statsLoading ? "..." : stats?.totalBooks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Autores Únicos:</span>
                    <span className="font-medium text-foreground" data-testid="stat-unique-authors">
                      {statsLoading ? "..." : stats?.uniqueAuthors || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ISBNs Únicos:</span>
                    <span className="font-medium text-foreground" data-testid="stat-unique-isbns">
                      {statsLoading ? "..." : stats?.uniqueISBNs || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="text-frequent-authors-title">
                  Autores Frequentes
                </h3>
                <div className="space-y-2" data-testid="list-frequent-authors">
                  {statsLoading ? (
                    <p className="text-muted-foreground text-sm">Carregando...</p>
                  ) : !stats?.frequentAuthors || stats.frequentAuthors.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Nenhum dado disponível</p>
                  ) : (
                    stats.frequentAuthors.map((item, index) => (
                      <div key={index} className="flex justify-between items-center" data-testid={`frequent-author-${index}`}>
                        <span className="text-foreground text-sm">{item.author}</span>
                        <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded">
                          {item.count} livro{item.count > 1 ? 's' : ''}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
