# DineTogether (FoodieConnect) - Nền Tảng Kết Nối Bạn Ăn Chung & Săn Deal Nhóm

Dự án Frontend hoàn chỉnh cho nền tảng kết nối những người xa lạ đi ăn chung, tối ưu chi phí, thưởng thức nhiều món ngon, chia bill sòng phẳng và mở khóa voucher ưu đãi nhóm của các nhà hàng.

## 🚀 Tính năng nổi bật

### 1. Màn hình Đầu vào Chia đôi (Split Screen 50/50)
- **Cột Trái (50%)**: 
  - Đăng nhập / Đăng ký tài khoản mới.
  - **Bộ chuyển đổi vai trò trải nghiệm nhanh (1-Click Quick Demo Login)**: Đăng nhập ngay với tư cách thực khách (Nguyễn Hoàng Tuấn, Trần Thảo Mai, Lê Quốc Bảo...) hoặc Quản lý nhà hàng (Haidilao, Gogi House).
  - Trình bày 6 giá trị cốt lõi: Tạo niềm vui, Ăn nhiều món, Chia nhỏ hóa đơn, Săn voucher nhóm, Kết bạn mới, Đánh giá uy tín.
- **Cột Phải (50%)**:
  - Bản đồ vệ tinh/đường phố tương tác (Leaflet) hiển thị vị trí GPS hiện tại của người dùng.
  - Các pin định vị nhà hàng kèm badge thông tin ("Deal", rating, khoảng cách).
  - Card xem trước khi bấm vào quán kèm nút chuyển thẳng vào bàn ăn.

### 2. Trang Chủ Tìm Bạn Ăn Chung (Main Feed) - Giao diện mặc định sau đăng nhập
- **Bộ lọc thông minh**:
  - Tìm kiếm theo món ăn, tên quán ăn hoặc địa chỉ.
  - Sắp xếp theo: **Gần vị trí tôi nhất**, **Voucher nhóm khủng nhất**, **Đánh giá sao cao nhất**, **Bài đăng mới nhất**.
  - Phân loại món ăn: Lẩu Trung Hoa, Nướng BBQ Hàn, Ốc & Hải Sản Sài Gòn, Lẩu Bò...
- **Đăng bài tuyển bạn ăn chung**:
  - Chọn nhà hàng, số lượng thành viên (2-8 người), giờ ăn dự kiến.
  - Chọn áp dụng voucher nhóm có sẵn tại quán.
  - **Mời bạn bè trong danh sách**: Gửi thông báo mời trực tiếp tới tài khoản bạn bè.
- **Thẻ Bàn Ăn Chi Tiết**:
  - Thanh tiến độ hiển thị số lượng thành viên đã tham gia (ví dụ: 3/4 người).
  - Khoảng cách GPS thực tế từ người dùng tới quán.
  - Avatar các thành viên đang ngồi trong bàn.
  - Nút **"⚡ + Fill người lạ"** để kiểm thử ngay trạng thái bàn đủ người mà không cần mở nhiều tab.

### 3. Phòng Thảo Luận & Chốt Bàn (Discussion & Locking Room)
- Hiển thị danh sách thành viên, chủ bàn, và lời giới thiệu bản thân của từng người.
- **Tin nhắn thảo luận trực tiếp**: Các thành viên trao đổi món ăn, sở thích (các nút chọn nhanh: *Mê ăn cay*, *Ăn không cay*, *Đúng giờ*...).
- **Điều chỉnh linh hoạt**: Có thể thay đổi giờ hẹn và tăng/giảm số lượng người trước khi chốt.
- **Nút "Chốt Bàn Ngay"**:
  - **Với Quán đã liên kết trên hệ thống** (VD: Haidilao, Gogi): Hệ thống tự động bắn đơn đặt bàn sang Kênh Quản trị của Nhà hàng.
  - **Với Quán chưa đăng ký tài khoản** (VD: Ốc Đào vỉa hè): Mở hộp thoại bầu chọn 1 thành viên gọi Hotline giữ chỗ trước cho cả nhóm.

### 4. Trang Săn Ưu Đãi Gần Bạn (Nearby Deals)
- Quét và hiển thị toàn bộ voucher nhóm của các nhà hàng xung quanh bạn.
- Tự động sắp xếp ưu tiên quán gần nhất tính theo công thức Haversine.
- Lọc theo bán kính: Trong 1km, 2km, 5km.
- Nút **"Tạo Bàn Ăn Deal Này Ngay"** tự động áp mã và mở form tạo nhóm.

### 5. Trang Cá Nhân & Mạng Xã Hội (User Profile)
- Xem thông tin, cấp độ uy tín (trust score), số lần ghép bàn thành công.
- **Cài đặt sở thích ẩm thực**: Quản lý các thẻ gu ăn uống (Lẩu nướng, Cay cấp 3, Không ăn hành, Budget 150k...).
- **Đăng bài review & trải nghiệm**: Chia sẻ ảnh, viết bài review về các bữa ăn chung.
- **Danh sách bạn bè**: Xem hồ sơ công khai của bạn bè, gu ẩm thực và nút rủ đi ăn ngay.

### 6. Kênh Quản Trị Nhà Hàng Đối Tác (Restaurant Partner Portal)
- Cho phép chuyển đổi linh hoạt giữa các chi nhánh nhà hàng liên kết.
- **Tiếp nhận đơn đặt bàn**: Xem thông tin nhóm khách, giờ đến, số người, ghi chú và nút **"Tiếp Nhận & Giữ Bàn"**.
- **Quản lý thực đơn**: Thêm món ăn mới, chỉnh sửa giá, phân loại món, bật/tắt trạng thái Còn món / Hết món, xóa món.
- **Phát hành voucher nhóm**: Tạo mã khuyến mãi mới với điều kiện số lượng khách tối thiểu.

### 7. Mock Data Engine với LocalStorage
- Mọi dữ liệu (món ăn, voucher, bàn ăn, tin nhắn chat, đơn đặt bàn, bài viết) được lưu trực tiếp vào `localStorage`.
- Thao tác trên mọi nút bấm có hiệu lực tức thì và duy trì khi F5 reload trang.
- Nút **Reset dữ liệu mẫu** trên thanh điều hướng để khôi phục trạng thái ban đầu bất cứ khi nào.

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

```bash
# Cài đặt dependencies (nếu chưa cài)
npm install

# Khởi chạy server phát triển
npm run dev

# Build kiểm tra sản phẩm
npm run build
```
Truy cập ứng dụng tại đường dẫn hiển thị trên terminal (mặc định: `http://localhost:5173`).
