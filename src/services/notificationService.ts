import { api } from "../api/client";
import { AppNotification } from "../types";

// TODO BT9.5a: Lấy danh sách thông báo của user, mới nhất ở trên cùng
export async function getNotifications(userId: number): Promise<AppNotification[]> {
  const res = await api.get<AppNotification[]>("/notifications", {
    params: { userId, _sort: "createdAt", _order: "desc" },
  });
  return res.data;
}

// TODO BT9.5b: Đánh dấu thông báo đã đọc
export async function markAsRead(id: number): Promise<AppNotification> {
  const res = await api.patch<AppNotification>(`/notifications/${id}`, { read: true });
  return res.data;
}
