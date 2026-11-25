export type TYPE_ACTIVITY_LOG = {
  log_id: number;
  user_id: number | null;
  action: string;
  timestamp: string;
  details: unknown;
  user?: { user_id: number; full_name?: string; username?: string } | null;
};

export type TYPE_ACTIVITY_LOG_PARAMS = {
  user_id?: number;
  action?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
};
