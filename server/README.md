## **Ứng dụng phát nhạc SoundClone**

- Mô tả: Ứng dụng phát nhạc trực tuyến phát triển trên cơ sở học tập và phát triển thành tựu từ các ứng dụng thành công khác. Sử dụng các công nghệ: Docker, MySQL, Axious, Node JS, React Native 
## **Các yêu cầu nghiệp vụ:**
- Đối với người dùng:
1. Người dùng được tạo tài khoản ứng dụng và đăng nhập để sử dụng các dịch vụ của ứng dụng. Trong quá trình sử dụng, có thể thay đổi mật khẩu theo ý muốn.
2. Ứng dụng cung cấp chức năng phát nhạc theo đề xuất và theo các danh sách có sẵn (playlist, album).
3. Ứng dụng cung cấp chức năng phát tìm kiếm nhạc, có thể tìm kiếm theo thể loại hoặc theo tên bài hát, tên album, tên nghệ sĩ.
4. Người dùng có thể tạo, sửa và  xóa playlist cá nhân, có thể lựa chọn công khai playlist cho người dùng khác có thể xem hoặc lựa chọn riêng tư, không hiển thị với người dùng khác.
5. Người dùng có thể lựa chọn thích hoặc không thích một bài hát, nếu không thích, bài hát đó sẽ bị loại khỏi danh sách đề xuất.

![477842310_2030290124127889_4362368252249997956_n](https://github.com/user-attachments/assets/75f16911-610d-4394-b205-49bbe4488962)

* Đối với quản trị viên:
1. Quản trị viên có tài khoản được khởi tạo sẵn, có giao diện riêng.
2. Quản trị viên được phép tải các bài hát, album mới, thêm thông tin về nghệ sĩ, thể loại cho bài hát.
3. Quản trị viên được cấp quyền quản lí dữ liệu về: thông tin về bài hát, thông tin thời gian phát nhạc.
4. Quản trị viên có thể xuất báo cáo về những danh mục dữ liệu được cho phép.

![image](https://github.com/user-attachments/assets/d74127cb-0953-46a4-ac0f-3a6b9e457f5f)

## **Sơ đồ ERD**  
  
![image](https://github.com/user-attachments/assets/06277aac-308f-41de-8873-b0c52ef9cba3)

1. Mỗi người dùng có thể có không hoặc nhiều playlist, nhưng mỗi playlist chỉ thuộc về một người dùng duy nhất. Do đó, giữa USER và PLAYLIST có quan hệ 1:N.
2. Mỗi playlist có thể chứa nhiều bài hát, và một bài hát có thể xuất hiện trong nhiều playlist khác nhau. Vì vậy, giữa PLAYLIST và SONGS có quan hệ N:N, được quản lý thông qua bảng trung gian PLAYLIST_SONG, tạo thành hai mối quan hệ 1:N.
3. Người dùng có thể theo dõi nhiều nghệ sĩ, và một nghệ sĩ cũng có thể có nhiều người theo dõi. Do đó, giữa USER và ARTIST có quan hệ N:N, được quản lý qua bảng trung gian FOLLOW_ARTIST, hình thành hai mối quan hệ 1:N.
4. Mỗi bài hát được trình diễn bởi một nghệ sĩ chính, nhưng một nghệ sĩ có thể trình diễn nhiều bài hát, do đó giữa ARTIST và SONGS là 1:N.
5. Người dùng có thể có không hoặc nhiều vai trò, và một vai trò cũng có thể thuộc về nhiều người dùng. Do đó, giữa USER và ROLE có quan hệ N:N, được quản lý qua bảng trung gian USER_ROLE, hình thành hai mối quan hệ 1:N.
6. Một vai trò sẽ có thể có nhiều quyền hạn khác nhau, nhưng quyền hạn sẽ chỉ thuộc về một vai trò nhất định, do đó giữa ROLE và ROLE_PERMISSION có mối quan hệ 1:N.
