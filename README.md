# Hệ Thống Quản Lý Dự Án TBA 220kV Cần Đước

Trang web dashboard theo dõi tiến độ:
1. Công tác Bồi thường - Giải phóng mặt bằng (GPMB).
2. Công tác Thi công xây lắp & Thiết bị (Nhất thứ, Nhị thứ, PCCC).
3. Bản đồ số WebGIS vị trí mặt bằng và hướng tuyến đấu nối.

## Cấu trúc thư mục:
- `index.html`: Giao diện Dashboard.
- `js/app.js`: Logic render dữ liệu, tích hợp biểu đồ Chart.js & bản đồ Leaflet.
- `data/project_data.json`: File dữ liệu chi tiết của dự án.
- `css/style.css`: Định dạng style bổ sung.

## Triển khai trên GitHub Pages:
1. Đẩy code lên nhánh `main`.
2. Vào Settings -> Pages -> Chọn nhánh `main` (root) -> Save.
