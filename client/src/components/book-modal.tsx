import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { type Book, type InsertBook } from "@shared/schema";

interface BookModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (book: InsertBook) => void;
  book?: Book | null;
  isLoading?: boolean;
}

export function BookModal({ open, onClose, onSubmit, book, isLoading }: BookModalProps) {
  const [formData, setFormData] = useState<InsertBook>({
    name: "",
    author: "",
    isbn: ""
  });

  useEffect(() => {
    if (book) {
      setFormData({
        name: book.name,
        author: book.author,
        isbn: book.isbn
      });
    } else {
      setFormData({
        name: "",
        author: "",
        isbn: ""
      });
    }
  }, [book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      return;
    }
    
    onSubmit(formData);
  };

  const handleChange = (field: keyof InsertBook) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-book">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">
            {book ? "Editar Livro" : "Novo Livro"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bookName">Nome do Livro</Label>
            <Input
              id="bookName"
              value={formData.name}
              onChange={handleChange("name")}
              placeholder="Digite o nome do livro"
              required
              data-testid="input-book-name"
            />
          </div>
          
          <div>
            <Label htmlFor="bookAuthor">Autor</Label>
            <Input
              id="bookAuthor"
              value={formData.author}
              onChange={handleChange("author")}
              placeholder="Digite o nome do autor"
              required
              data-testid="input-book-author"
            />
          </div>
          
          <div>
            <Label htmlFor="bookISBN">ISBN</Label>
            <Input
              id="bookISBN"
              value={formData.isbn}
              onChange={handleChange("isbn")}
              placeholder="Digite o ISBN (ex: 978-0-123456-78-9)"
              required
              data-testid="input-book-isbn"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
              data-testid="button-save-book"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-book"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
