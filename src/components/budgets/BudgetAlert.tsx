
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle, Target } from "lucide-react";

interface Budget {
  id: string;
  category_id: string;
  limit_amount: number;
  spent_amount: number;
  period: string;
}

interface Category {
  id: string;
  name: string;
}

interface BudgetAlertProps {
  budgets: Budget[];
  categories: Category[];
}

const BudgetAlert = ({ budgets, categories }: BudgetAlertProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria removida';
  };

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (Number(budget.spent_amount) / Number(budget.limit_amount)) * 100;
    const remaining = Number(budget.limit_amount) - Number(budget.spent_amount);

    if (percentage >= 100) {
      return {
        status: 'exceeded',
        variant: 'destructive' as const,
        icon: XCircle,
        title: 'Orçamento Excedido',
        message: `Você excedeu o orçamento de ${getCategoryName(budget.category_id)} em ${formatCurrency(Math.abs(remaining))}`,
        percentage: Math.min(percentage, 100),
        color: 'bg-red-100 border-red-500'
      };
    } else if (percentage >= 80) {
      return {
        status: 'warning',
        variant: 'default' as const,
        icon: AlertTriangle,
        title: 'Atenção ao Orçamento',
        message: `Você usou ${percentage.toFixed(0)}% do orçamento de ${getCategoryName(budget.category_id)}. Restam ${formatCurrency(remaining)}`,
        percentage,
        color: 'bg-yellow-100 border-yellow-500'
      };
    } else if (percentage >= 50) {
      return {
        status: 'moderate',
        variant: 'default' as const,
        icon: Target,
        title: 'Orçamento no Caminho Certo',
        message: `Você usou ${percentage.toFixed(0)}% do orçamento de ${getCategoryName(budget.category_id)}. Restam ${formatCurrency(remaining)}`,
        percentage,
        color: 'bg-blue-100 border-blue-500'
      };
    } else {
      return {
        status: 'good',
        variant: 'default' as const,
        icon: CheckCircle,
        title: 'Orçamento Controlado',
        message: `Orçamento de ${getCategoryName(budget.category_id)} está bem controlado. Restam ${formatCurrency(remaining)}`,
        percentage,
        color: 'bg-green-100 border-green-500'
      };
    }
  };

  // Filtrar apenas orçamentos que precisam de alerta (acima de 50% ou excedidos)
  const alertBudgets = budgets.filter(budget => {
    const percentage = (Number(budget.spent_amount) / Number(budget.limit_amount)) * 100;
    return percentage >= 50;
  }).sort((a, b) => {
    const percentageA = (Number(a.spent_amount) / Number(a.limit_amount)) * 100;
    const percentageB = (Number(b.spent_amount) / Number(b.limit_amount)) * 100;
    return percentageB - percentageA; // Maior porcentagem primeiro
  });

  if (alertBudgets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-lg font-semibold">Alertas de Orçamento</h3>
      {alertBudgets.map((budget) => {
        const status = getBudgetStatus(budget);
        const Icon = status.icon;

        return (
          <Alert key={budget.id} variant={status.variant} className={status.color}>
            <Icon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{status.title}</p>
                  <Badge variant={status.status === 'exceeded' ? 'destructive' : 'outline'}>
                    {status.percentage.toFixed(0)}%
                  </Badge>
                </div>
                <p className="text-sm">{status.message}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Gasto: {formatCurrency(Number(budget.spent_amount))}</span>
                    <span>Limite: {formatCurrency(Number(budget.limit_amount))}</span>
                  </div>
                  <Progress 
                    value={Math.min(status.percentage, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};

export default BudgetAlert;
