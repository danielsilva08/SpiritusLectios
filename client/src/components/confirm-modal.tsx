import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function ConfirmModal({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Confirmar Exclusão",
  description = "Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.",
  isLoading 
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-confirm">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle data-testid="text-confirm-title">{title}</DialogTitle>
          </div>
          <DialogDescription data-testid="text-confirm-description">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-3 pt-4">
          <Button 
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
            disabled={isLoading}
            data-testid="button-confirm-delete"
          >
            Excluir
          </Button>
          <Button 
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            data-testid="button-cancel-delete"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
