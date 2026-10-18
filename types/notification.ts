export type NotificationType = "risk_zone" | "device_alert" | "system";

export type Notification = {
  notif_id: number;
  user_id: number;
  notification_type: NotificationType;
  message: string;
  animal_id: number | null;
  zone_id: number | null;
  device_id: number | null;
  is_read: boolean | number;
  created_at: string;
};

export type NotificationListParams = {
  onlyUnread?: boolean;
  type?: NotificationType;
};