Website React & Laravel với MySQL (XAMPP)
Giới thiệu
Đây là một ứng dụng web sử dụng React cho giao diện người dùng (frontend) và Laravel cho API cùng logic phía server (backend), với MySQL được quản lý qua XAMPP làm cơ sở dữ liệu. Dự án này nhằm cung cấp một nền tảng [mô tả ngắn về mục đích của website, ví dụ: quản lý người dùng, thương mại điện tử, blog, v.v.].
Công nghệ sử dụng

Frontend: React, Tailwind CSS, Axios
Backend: Laravel, MySQL (qua XAMPP)
Công cụ khác: Composer, Node.js, npm, XAMPP

Yêu cầu hệ thống

XAMPP (bao gồm PHP >= 8.1, MySQL, Apache)
Composer
Node.js >= 16.x
npm hoặc Yarn
Hệ điều hành: Windows, macOS, hoặc Linux

Hướng dẫn cài đặt
0. Cài đặt XAMPP

Tải và cài đặt XAMPP:

Tải XAMPP từ trang chính thức và cài đặt theo hướng dẫn.
Đảm bảo bật các module Apache và MySQL trong bảng điều khiển XAMPP.


Kiểm tra MySQL:

Mở XAMPP Control Panel, khởi động MySQL.
Truy cập http://localhost/phpmyadmin để kiểm tra giao diện quản lý cơ sở dữ liệu.



1. Cài đặt Backend (Laravel)

Clone repository:
git clone <URL_REPOSITORY>
cd <project-folder>


Cài đặt dependencies:
composer install


Sao chép file môi trường:
cp .env.example .env


Cấu hình file .env:

Cập nhật thông tin cơ sở dữ liệu:DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=<your_database_name>
DB_USERNAME=root
DB_PASSWORD=


Lưu ý: Mặc định, XAMPP sử dụng root làm tên người dùng MySQL và không có mật khẩu. Nếu bạn đã đặt mật khẩu, hãy cập nhật DB_PASSWORD.


Tùy chỉnh các biến môi trường khác nếu cần (APP_URL, API keys, v.v.).


Tạo cơ sở dữ liệu:

Mở http://localhost/phpmyadmin.
Tạo một cơ sở dữ liệu mới với tên khớp với DB_DATABASE trong file .env.


Tạo khóa ứng dụng:
php artisan key:generate


Chạy migration và seed (nếu có):
php artisan migrate --seed


Khởi động server Laravel:
php artisan serve

Backend sẽ chạy tại http://localhost:8000 (mặc định).


2. Cài đặt Frontend (React)

Chuyển đến thư mục frontend:
cd frontend


Cài đặt dependencies:
npm install


Cấu hình API endpoint:

Trong thư mục frontend, tìm file cấu hình (thường là .env).
Cập nhật URL của backend, ví dụ:VITE_API_URL=http://localhost:8000/api


Lưu ý: Nếu dự án sử dụng Vite, biến môi trường thường bắt đầu bằng VITE_. Kiểm tra file .env trong thư mục frontend.




Khởi động server React:
npm run dev

Frontend sẽ chạy tại http://localhost:5173 (mặc định với Vite) hoặc một cổng khác được cấu hình trong dự án.


3. Kiểm tra ứng dụng

Mở trình duyệt và truy cập http://localhost:5173 (hoặc cổng được hiển thị sau khi chạy npm run dev) để xem giao diện frontend.
Đảm bảo backend tại http://localhost:8000 đang hoạt động và trả về dữ liệu qua API.

Gỡ lỗi thường gặp

Lỗi kết nối MySQL:
Kiểm tra Apache và MySQL đang chạy trong XAMPP.
Đảm bảo thông tin trong .env khớp với cấu hình MySQL.


Lỗi CORS:
Trong Laravel, kiểm tra middleware CORS trong app/Http/Kernel.php hoặc cấu hình trong config/cors.php.


Lỗi dependencies:
Xóa thư mục vendor và composer.lock, sau đó chạy lại composer install.
Tương tự, xóa node_modules và package-lock.json trong thư mục frontend, sau đó chạy npm install.


Lỗi npm run dev:
Đảm bảo bạn đang ở thư mục frontend.
Kiểm tra file package.json để xác nhận script dev tồn tại (thường liên quan đến Vite hoặc Webpack).



Đóng góp

Fork repository.
Tạo branch mới (git checkout -b feature/ten-tinh-nang).
Commit thay đổi (git commit -m 'Thêm tính năng XYZ').
Push lên branch (git push origin feature/ten-tinh-nang).
Tạo Pull Request.

Liên hệ
Nếu bạn có câu hỏi hoặc cần hỗ trợ, liên hệ qua [email hoặc kênh liên lạc khác].
