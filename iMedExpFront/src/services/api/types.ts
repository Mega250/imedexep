export type PageQuery = {
  page?: number;
  limit?: number;
};

export type ListResponse<T> = {
  total: number;
  page: number;
  limit: number;
  items: T[];
};

export type MessageResponse = {
  message: string;
};
