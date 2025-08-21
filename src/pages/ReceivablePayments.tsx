
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/shared/AppLayout";
import ReceivablePaymentList from "@/components/receivables/ReceivablePaymentList";
import ReceivableStats from "@/components/receivables/ReceivableStats";
import { useSupabaseData } from "@/hooks/useSupabaseData";

const ReceivablePayments = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { data: payments } = useSupabaseData('receivable_payments', user?.id);

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
          <h1 className="text-2xl font-bold text-foreground mb-1">Pagamentos à Receber</h1>
          <p className="text-muted-foreground">Gerencie seus pagamentos pendentes e recebidos</p>
        </div>
        
        <ReceivableStats payments={payments} />
        
        <ReceivablePaymentList />
      </div>
    </AppLayout>
  );
};

export default ReceivablePayments;
