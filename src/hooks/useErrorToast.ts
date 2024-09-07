// hooks/useErrorToast.ts
import { useToast } from "@/hooks/useToast";

export function useErrorToast() {
  const { toast } = useToast();
  return (description: string) => {
    toast({
      title: "Error",
      description,
      variant: "destructive",
    } as const);
  };
}
