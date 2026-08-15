export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  image: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
