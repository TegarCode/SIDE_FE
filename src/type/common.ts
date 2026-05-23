export type ApiResponse<T> = {
  data: T;
  status: number;
  success: boolean;
};

export type Option<TValue = string> = {
  label: string;
  value: TValue;
};
