import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator } from 'react-native';
import { Heart } from 'iconsax-react-native';
import { usePlayerStore } from '../stores/usePlayerStore';

const LikeButton = () => {
  const { isLiked, togglePlayerLike } = usePlayerStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleLike = async () => {
    setIsLoading(true);
    try {
      await togglePlayerLike();
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('LikeButton isLiked:', isLiked); // Debug

  return (
    <TouchableOpacity
      onPress={handleToggleLike}
      disabled={isLoading}
      style={{ opacity: isLoading ? 0.5 : 1 }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#d9e3f0" />
      ) : (
        <Heart
          size="32"
          color="#d9e3f0"
          variant={isLiked ? 'Bold' : 'Outline'}
        />
      )}
    </TouchableOpacity>
  );
};

export default LikeButton;