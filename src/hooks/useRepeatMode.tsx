import { useCallback, useEffect, useState } from 'react';
import TrackPlayer from 'react-native-track-player';

export const useRepeatMode = () => {
    const [repeatMode, setRepeatMode] = useState(null);

    const changeRepeatMode = useCallback(async (repeatMode) => {
        await TrackPlayer.setRepeatMode(repeatMode);
    }, []);

    useEffect(() => {
        TrackPlayer.getRepeatMode().then(setRepeatMode);

        setRepeatMode(repeatMode);
    }, []);

    return {
        repeatMode,
        changeRepeatMode,
    };
};