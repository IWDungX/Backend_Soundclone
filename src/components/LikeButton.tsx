import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { Heart } from 'iconsax-react-nativejs'; // Giả sử bạn sử dụng thư viện này
import { usePlayerStore } from '../stores/usePlayerStore'; // Import usePlayerStore

const LikeButton = () => {
  const { isLiked, toggleLike } = usePlayerStore(); // Lấy isLiked và toggleLike từ store
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading

  const handleToggleLike = async () => {
    setIsLoading(true); // Bắt đầu loading
    try {
      await toggleLike(); // Gọi toggleLike từ store (sẽ tự lấy token từ apiLikeSong)
      // Trạng thái isLiked sẽ được cập nhật tự động từ store
    } catch (error) {
      console.error('Lỗi khi toggleLike:', error);
      // Có thể hiển thị thông báo lỗi cho người dùng (tùy chọn)
    } finally {
      setIsLoading(false); // Kết thúc loading
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggleLike}
      disabled={isLoading} // Vô hiệu hóa nút khi đang loading
      style={{ opacity: isLoading ? 0.5 : 1 }} // Thêm hiệu ứng loading
    >
      {isLoading ? (
        <Heart size="32" color="#d9e3f0" variant="Bold" /> // Icon loading (có thể thay bằng animation)
      ) : isLiked ? (
        <Heart size="32" color="#d9e3f0" variant="Bold" />
      ) : (
        <Heart size="32" color="#d9e3f0" />
      )}
    </TouchableOpacity>
  );
};

export default LikeButton;