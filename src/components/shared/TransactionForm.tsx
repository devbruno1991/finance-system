
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useAuth } from "@/hooks/useAuth";
import { useTransactionFormSubmit } from "@/hooks/useTransactionFormSubmit";
import TransactionTypeSelector from "./TransactionTypeSelector";
import TransactionFormFields from "./TransactionFormFields";
import PaymentMethodSelector from "./PaymentMethodSelector";
import TagSelector from "./TagSelector";

interface TransactionFormProps {
  defaultAccountId?: string;
  defaultCardId?: string;
  defaultGoalId?: string;
  onTransactionAdded?: () => void;
  onCancel?: () => void;
}

const TransactionForm = ({ 
  defaultAccountId, 
  defaultCardId, 
  defaultGoalId,
  onTransactionAdded,
  onCancel
}: TransactionFormProps) => {
  const { user } = useAuth();
  const { data: categories } = useSupabaseData('categories', user?.id);
  const { data: accounts } = useSupabaseData('accounts', user?.id);
  const { data: cards } = useSupabaseData('cards', user?.id);
  
  const [open, setOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [balanceError, setBalanceError] = useState<string>("");
  const [formData, setFormData] = useState({
    type: defaultGoalId ? "income" : "expense",
    description: "",
    amount: "",
    category_id: "",
    account_id: defaultAccountId || "",
    card_id: defaultCardId || "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  // Check balance whenever amount, type, or payment method changes
  useEffect(() => {
    checkBalance();
  }, [formData.amount, formData.type, formData.account_id, formData.card_id, accounts, cards]);

  const checkBalance = () => {
    setBalanceError("");
    
    if (!formData.amount || formData.type !== 'expense') {
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    // Check account balance
    if (formData.account_id) {
      const account = accounts?.find(acc => acc.id === formData.account_id);
      if (account) {
        const currentBalance = parseFloat(account.balance);
        if (amount > currentBalance) {
          setBalanceError(`Saldo insuficiente na conta ${account.name}. Saldo atual: R$ ${currentBalance.toFixed(2)}`);
          return;
        }
      }
    }

    // Check card limit
    if (formData.card_id) {
      const card = cards?.find(c => c.id === formData.card_id);
      if (card) {
        const creditLimit = parseFloat(card.credit_limit);
        const usedAmount = parseFloat(card.used_amount);
        const availableLimit = creditLimit - usedAmount;
        
        if (amount > availableLimit) {
          setBalanceError(`Limite insuficiente no cartão ${card.name}. Limite disponível: R$ ${availableLimit.toFixed(2)}`);
          return;
        }
      }
    }
  };

  const handleTransactionAdded = () => {
    console.log('Transaction added - refreshing data and closing dialog');
    
    if (onTransactionAdded) {
      onTransactionAdded();
    }
    
    setTimeout(() => {
      setOpen(false);
    }, 200);
  };

  const { handleSubmit, loading } = useTransactionFormSubmit(defaultGoalId, handleTransactionAdded);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    console.log('Selected tags:', selectedTags);
    
    // Don't submit if there's a balance error
    if (balanceError) {
      return;
    }
    
    const success = await handleSubmit(formData, selectedTags, true);
    
    if (success) {
      console.log('Transaction submission successful - resetting form');
      setFormData({
        type: defaultGoalId ? "income" : "expense",
        description: "",
        amount: "",
        category_id: "",
        account_id: defaultAccountId || "",
        card_id: defaultCardId || "",
        date: new Date().toISOString().split('T')[0],
        notes: "",
      });
      setSelectedTags([]);
      setBalanceError("");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the opposite payment method when one is selected
    if (name === 'account_id' && value) {
      setFormData((prev) => ({ ...prev, card_id: "" }));
    } else if (name === 'card_id' && value) {
      setFormData((prev) => ({ ...prev, account_id: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log('Select changed:', name, value);
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the opposite payment method when one is selected
    if (name === 'account_id' && value) {
      setFormData((prev) => ({ ...prev, card_id: "" }));
    } else if (name === 'card_id' && value) {
      setFormData((prev) => ({ ...prev, account_id: "" }));
    }
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    setOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleTagsChange = (tags: string[]) => {
    console.log('Tags changed:', tags);
    setSelectedTags(tags);
  };

  const isSubmitDisabled = loading || !!balanceError;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-finance-blue hover:bg-finance-blue/90 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>{defaultGoalId ? 'Adicionar à Meta' : 'Nova Transação'}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {defaultGoalId ? 'Adicionar Valor à Meta' : 'Adicionar Transação'}
          </DialogTitle>
          <DialogDescription>
            {defaultGoalId 
              ? 'Registre um valor para contribuir com sua meta.'
              : 'Registre uma nova receita ou despesa em sua conta.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={onSubmit} className="space-y-4">
            <TransactionTypeSelector
              formData={formData}
              onSelectChange={handleSelectChange}
              isGoalTransaction={!!defaultGoalId}
            />

            <TransactionFormFields
              formData={formData}
              categories={categories || []}
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
            />

            <PaymentMethodSelector
              formData={formData}
              accounts={accounts || []}
              cards={cards || []}
              onSelectChange={handleSelectChange}
              defaultAccountId={defaultAccountId}
              defaultCardId={defaultCardId}
            />

            {balanceError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{balanceError}</AlertDescription>
              </Alert>
            )}

            <TagSelector
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
            />
          </form>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitDisabled} 
            onClick={onSubmit}
            className={balanceError ? "opacity-50 cursor-not-allowed" : ""}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionForm;
