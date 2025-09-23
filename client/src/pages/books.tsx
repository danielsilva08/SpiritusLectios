import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BookModal } from "@/components/book-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { useToast } from "@/hooks/use-toast";
import { type Book, type InsertBook } from "@shared/schema";

export default function Books() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ['/api/books', { search: searchTerm }],
    queryFn: async () => {
      const url = searchTerm ? `/api/books?search=${encodeURIComponent(searchTerm)}` : '/api/books';
      const response = await apiRequest("GET", url);
      return response.json();
    }
  });

  const createBookMutation = useMutation({
    mutationFn: (book: InsertBook) => apiRequest("POST", "/api/books", book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books/stats'] });
      setModalOpen(false);
      setEditingBook(null);
      toast({
        title: "Livro cadastrado com sucesso!",
        description: "O livro foi adicionado ao seu acervo."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao cadastrar livro",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, book }: { id: number; book: InsertBook }) => 
      apiRequest("PUT", `/api/books/${id}`, book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books/stats'] });
      setModalOpen(false);
      setEditingBook(null);
      toast({
        title: "Livro editado com sucesso!",
        description: "As alterações foram salvas."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao editar livro",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books/stats'] });
      setConfirmOpen(false);
      setDeletingBook(null);
      toast({
        title: "Livro excluído com sucesso!",
        description: "O livro foi removido do seu acervo."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir livro",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  });

  const handleAddBook = () => {
    setEditingBook(null);
    setModalOpen(true);
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setModalOpen(true);
  };

  const handleDeleteBook = (book: Book) => {
    setDeletingBook(book);
    setConfirmOpen(true);
  };

  const handleBookSubmit = (bookData: InsertBook) => {
    if (editingBook) {
      updateBookMutation.mutate({ id: Number(editingBook.id), book: bookData });
    } else {
      createBookMutation.mutate(bookData);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingBook) {
      deleteBookMutation.mutate(Number(deletingBook.id));
    }
  };

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2" data-testid="text-books-title">
              Gestão de Livros
            </h2>
            <p className="text-muted-foreground" data-testid="text-books-subtitle">
              Adicione, edite e gerencie seu acervo
            </p>
          </div>
          <Button onClick={handleAddBook} data-testid="button-add-book">
            <Plus className="h-4 w-4 mr-2" />
            Novo Livro
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome, autor ou ISBN..."
              className="pl-10"
              data-testid="input-search-books"
            />
          </div>
        </div>

        {/* Books Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Livro</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-testid="table-books">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : books.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? "Nenhum livro encontrado" : "Nenhum livro cadastrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  books.map((book) => (
                    <TableRow key={book.id} data-testid={`book-row-${book.id}`}>
                      <TableCell className="font-medium">{book.name}</TableCell>
                      <TableCell className="text-muted-foreground">{book.author}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">{book.isbn}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditBook(book)}
                            data-testid={`button-edit-${book.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBook(book)}
                            data-testid={`button-delete-${book.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <BookModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingBook(null);
          }}
          onSubmit={handleBookSubmit}
          book={editingBook}
          isLoading={createBookMutation.isPending || updateBookMutation.isPending}
        />

        <ConfirmModal
          open={confirmOpen}
          onClose={() => {
            setConfirmOpen(false);
            setDeletingBook(null);
          }}
          onConfirm={handleConfirmDelete}
          isLoading={deleteBookMutation.isPending}
        />
      </div>
    </Layout>
  );
}
