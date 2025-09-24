import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Book, LogIn } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (password: string) => authService.login({ username: "admin", password }),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
        setLocation('/');
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao Spiritus Lectoris."
        });
      }
    },
    onError: () => {
      toast({
        title: "Senha incorreta",
        description: "Por favor, tente novamente.",
        variant: "destructive"
      });
      setPassword("");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      loginMutation.mutate(password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Book className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-app-title">
                Spiritus Lectoris
              </h1>
              <p className="text-muted-foreground" data-testid="text-app-subtitle">
                Sistema de Gestão de Livros
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="password">Senha de Acesso</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  required
                  data-testid="input-password"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
