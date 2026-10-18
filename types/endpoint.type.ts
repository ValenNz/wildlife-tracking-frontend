export type TYPE_ORDER_DIRECTION = "asc" | "desc";

export type QUERY_PARAMS_API_GET_ALL = {
  page: number;
  per_page: number;
  order?: TYPE_ORDER_DIRECTION;
  orderBy?: string;
  search?: string;
};

export type QUERY_PARAMS_API_GET_ALL_FILTERS = Omit<
  QUERY_PARAMS_API_GET_ALL,
  "page" | "per_page"
>;

export type TYPE_MUTATION_RESULT<T> = {
  data: T;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
  reset: () => void;
};