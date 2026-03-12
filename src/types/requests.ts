export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface AddExpenseRequest {
  group_id: string;
  description: string;
  amount: number;
  paid_by: string;
  splits: {
    user_id: string;
    amount: number;
    weight?: number;
  }[];
}
