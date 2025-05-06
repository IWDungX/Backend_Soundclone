import { useCallback, useEffect, useState } from 'react';
import TrackPlayer, { RepeatMode } from 'react-native-track-player';

export const useRepeatMode = () => {
  const [repeatMode, setRepeatMode] = useState(null);

  const changeRepeatMode = useCallback(async (mode) => {
    await TrackPlayer.setRepeatMode(mode);
    setRepeatMode(mode);
  }, []);

  useEffect(() => {
    const fetchRepeatMode = async () => {
      const mode = await TrackPlayer.getRepeatMode();
      setRepeatMode(mode);
    };
    fetchRepeatMode();
  }, []);

  return {
    repeatMode,
    changeRepeatMode,
  };
};
