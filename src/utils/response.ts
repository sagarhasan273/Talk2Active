import { toast } from "sonner";

export function toastSuccessResponse(response: any, defaultMessage = 'Operation successful') {
  toast.success((response.data && response.data.status && response.data.message) ||
    (response.data && 'message' in response.data && (response.data as any).message) ||
    defaultMessage);
}

export function toastErrorResponse(response: any, defaultMessage = 'An error occurred') {
  toast.error((response.error && 'data' in response.error && (response.error as any).data?.message) ||
    (response.error && 'message' in response.error && (response.error as any).message) ||
    defaultMessage);
}

