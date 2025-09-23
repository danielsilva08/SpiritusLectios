import { useLocation } from "wouter";
import { LogOut, Book, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
      setLocation('/login');
      toast({
        title: "Logout realizado com sucesso!",
        description: "Você foi desconectado do sistema."
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Book className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Spiritus Lectoris</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Button
                variant={isActive('/') ? "default" : "ghost"}
                onClick={() => setLocation('/')}
                data-testid="nav-dashboard"
              >
                <PieChart className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={isActive('/books') ? "default" : "ghost"}
                onClick={() => setLocation('/books')}
                data-testid="nav-books"
              >
                <Book className="h-4 w-4 mr-2" />
                Livros
              </Button>
              <Button
                variant={isActive('/reports') ? "default" : "ghost"}
                onClick={() => setLocation('/reports')}
                data-testid="nav-reports"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </nav>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 py-4">
            <Button
              variant={isActive('/') ? "default" : "ghost"}
              size="sm"
              onClick={() => setLocation('/')}
              data-testid="nav-dashboard-mobile"
            >
              <PieChart className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={isActive('/books') ? "default" : "ghost"}
              size="sm"
              onClick={() => setLocation('/books')}
              data-testid="nav-books-mobile"
            >
              <Book className="h-4 w-4 mr-2" />
              Livros
            </Button>
            <Button
              variant={isActive('/reports') ? "default" : "ghost"}
              size="sm"
              onClick={() => setLocation('/reports')}
              data-testid="nav-reports-mobile"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatórios
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
