# Chạm Đũa (ChamDua) - Nền Tảng Kết Nối Bạn Ăn Chung & Săn Ưu Đãi Nhóm

**Chạm Đũa** là nền tảng kết nối những người xa lạ đi ăn chung theo phương châm *"Chạm đũa kết thân - Ăn ngon chia sẻ"*. Giúp mọi người nhân đôi niềm vui ẩm thực, thưởng thức nhiều món ngon, chia nhỏ chi phí và mở khóa các voucher ưu đãi nhóm của nhà hàng.

## 🚀 Các Tính Năng Nổi Bật

### 1. Màn hình Đầu vào Chia đôi (Split Screen 50/50)
- **Cột Trái (50%)**:
  - Tab **Đăng Nhập** & Tab **Đăng Ký Tài Khoản** rõ ràng.
  - **Quy trình hoàn thiện tối thiểu 80% hồ sơ sau khi đăng ký**:
    - Thanh đo tiến độ thời gian thực (0% - 100%).
    - Bắt buộc đạt $\ge 80\%$ (chọn gu ẩm thực, khu vực, bio, ngân sách, số điện thoại) mới mở khóa vào ứng dụng.
    - Cho phép bỏ qua một số thông tin không cần thiết.
  - **Bộ chọn tài khoản 1-Click Demo**: Đăng nhập ngay với tư cách thực khách (Nguyễn Hoàng Tuấn, Trần Thảo Mai...) hoặc Quản lý nhà hàng (Haidilao, Gogi House).
- **Cột Phải (50%)**:
  - Bản đồ vệ tinh/đường phố tương tác (Leaflet) quét nhà hàng, voucher và bàn ăn gần nhất quanh vị trí GPS.

### 2. Trang Chủ Mặc Định: Tìm Bạn Ăn Chung (Dining Feed)
- **Bộ lọc đa năng**: Lọc theo món ăn, nhà hàng, vị trí gần nhất (GPS), đánh giá sao, voucher nhóm.
- **Đăng bài tuyển bạn ăn**: Chọn nhà hàng, số người (2-8 người), giờ đến ăn, áp voucher và **mời bạn bè trong danh bạ**.
- **Thẻ bàn ăn trực quan**: Thanh tiến độ thành viên (VD: 3/4 người), khoảng cách thực tế, nút **"⚡ + Fill người lạ"** để test nhanh kịch bản đủ bàn.

### 3. Kèo Hẹn Lịch Xa & Gợi Ý Món Ăn (Tab "Bài Đăng Gần Bạn")
- Dành cho những ai muốn lên kèo ăn uống cho cuối tuần hoặc tuần tới mà **chưa cần chọn quán cụ thể**.
- Gợi ý món thèm (Buffet nướng, lẩu thái, dimsum, ốc...), khu vực muốn ăn, ngày hẹn xa, ngân sách dự kiến.
- Người xung quanh có thể bấm **"Tham gia kèo ăn này"** và thảo luận chọn quán phù hợp.

### 4. Bản Đồ Quán Ăn Trực Quan ở Giao Diện Chính (Tab "Bản Đồ Quán Ăn")
- Hiển thị toàn màn hình bản đồ GPS kèm các ghim quán ăn, ưu đãi và bàn ăn đang tuyển.
- Bấm vào bất kỳ ghim nào để xem card chi tiết và chuyển thẳng vào bàn ăn.

### 5. Phòng Thảo Luận, Đặt Món Trước & Thanh Toán Chia Bill (Discussion Room)
- **Hình thức đặt món & thanh toán linh hoạt**:
  - *Đặt món trước & Thanh toán trước (Pre-order & Pre-pay)*
  - *Đặt món trước & Ăn xong thanh toán (Pre-order & Post-pay)*
  - *Tới quán gọi món trực tiếp & Ăn xong thanh toán (Dine-in Order & Post-pay)*
- **Hóa đơn & Chia tiền tự động**:
  - Tự động trừ voucher nhóm (VD: Giảm 30% tổng hóa đơn).
  - Tự động tính tiền chia đều cho từng thành viên: `Tiền chia / người = Tổng hóa đơn / Số thành viên`.
  - Theo dõi trạng thái đã thanh toán của từng người.
  - Mã QR VietQR mô phỏng để chuyển khoản phần tiền chia.
  - Thanh toán thành công 100% $\rightarrow$ Chuyển trạng thái **COMPLETED** và thông báo sang Nhà hàng.

### 6. Săn Ưu Đãi Gần Bạn (Nearby Deals)
- Quét và sắp xếp tự động các voucher nhóm của nhà hàng theo khoảng cách GPS gần nhất.
- Nút "Tạo Bàn Ăn Deal Này Ngay" áp thẳng mã ưu đãi vào bàn.

### 7. Trang Cá Nhân & Mạng Xã Hội (User Profile)
- Thiết lập sở thích ăn uống (khẩu vị, cay/không cay, budget...).
- Đăng bài review, hình ảnh món ăn, kết nối danh sách bạn bè.

### 8. Kênh Quản Trị Nhà Hàng Đối Tác (Restaurant Portal)
- Nhận đơn đặt bàn nhóm kèm danh sách khách và các món đặt trước.
- Quản lý thực đơn (thêm, sửa món, đổi giá, đổi trạng thái Còn/Hết món).
- Phát hành voucher khuyến mãi nhóm.

### 9. Mock Data Engine với LocalStorage
- Lưu trữ 100% trên LocalStorage, mọi thay đổi duy trì khi F5 reload trang.
- Nút **Làm mới dữ liệu mẫu** trên Navbar để khôi phục trạng thái ban đầu bất cứ khi nào.

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy

```bash
# Cài đặt thư viện
npm install

# Chạy server phát triển
npm run dev

# Build kiểm tra sản phẩm
npm run build
```
Truy cập ứng dụng tại `http://localhost:5173`.
