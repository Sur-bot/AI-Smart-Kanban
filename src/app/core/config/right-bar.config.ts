export type RightBarPosition = 'top' | 'bottom' | 'popup-only';

export interface RightBarFeature {
  id: string;
  label: string; // Tên tab hiển thị trong Popup
  icon?: string; // Icon hiển thị ngoài thanh bar (Google Material Icon)
  tooltip?: string; // Tooltip khi hover ngoài thanh bar
  position: RightBarPosition; // Vị trí hiển thị
  barOrder?: number; // Thứ tự sắp xếp ngoài thanh bar
}

export const RIGHT_BAR_FEATURES: RightBarFeature[] = [
  // 1. Trò chuyện (Top)
  { id: 'chat', label: 'Trò chuyện', icon: 'chat', tooltip: 'Cuộc trò chuyện', position: 'top', barOrder: 3 },
  
  // 2. Cuộc trò chuyện tác vụ (Bottom)
  { id: 'task_chat', label: 'Cuộc trò chuyện tác vụ', icon: 'assistant', tooltip: 'Trợ lý ảo', position: 'bottom', barOrder: 1 },
  
  // 3. CoPilot (Top)
  { id: 'copilot', label: 'CoPilot', icon: 'smart_toy', tooltip: 'Chatbot AI', position: 'top', barOrder: 2 },
  
  // 4. Dự án hợp tác (Popup-only)
  { id: 'collab', label: 'Dự án hợp tác', position: 'popup-only' },
  
  // 5. Kênh (Bottom)
  { id: 'channel', label: 'Kênh', icon: 'newspaper', tooltip: 'Tin tức công ty', position: 'bottom', barOrder: 2 },
  
  // 6. Kênh Mở (Bottom)
  { id: 'open_channel', label: 'Kênh Mở', icon: 'forum', tooltip: 'Trò chuyện chung', position: 'bottom', barOrder: 3 },
  
  // 7. Thông báo (Top)
  { id: 'notifications', label: 'Thông báo', icon: 'notifications', tooltip: 'Thông báo', position: 'top', barOrder: 1 },
  
  // 8. Telephony (Popup-only)
  { id: 'telephony', label: 'Telephony', position: 'popup-only' },
  
  // 9. Kho ứng dụng (Popup-only)
  { id: 'apps', label: 'Kho ứng dụng', position: 'popup-only' },
  
  // 10. Các cài đặt (Bottom)
  { id: 'settings', label: 'Các cài đặt', icon: 'edit_note', tooltip: 'Ghi chú của tôi', position: 'bottom', barOrder: 4 }
];
