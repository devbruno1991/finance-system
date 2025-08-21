
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/shared/AppLayout";

const Categories = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Categorias</h1>
          <p className="text-muted-foreground">Gerencie suas categorias de receitas e despesas</p>
        </div>
        
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <p className="text-muted-foreground">Página de categorias em desenvolvimento.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Categories;
