
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/shared/AuthForm";
import Dashboard from "./Dashboard";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Index - Auth state:', { isAuthenticated, loading });
    if (!loading && isAuthenticated) {
      console.log('Redirecting to dashboard...');
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('User is authenticated, showing dashboard');
    return <Dashboard />;
  }

  console.log('User not authenticated, showing auth form');
  return <AuthForm />;
};

export default Index;
