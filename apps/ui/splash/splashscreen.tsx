import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

type SplashScreenProps = {
  onFinish?: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Shared opacity values
  const splash1 = useSharedValue(0);
  const splash2 = useSharedValue(0);
  const splash3 = useSharedValue(0);
  const splash4 = useSharedValue(0);
  const splashMiddle = useSharedValue(0);

  // Animate sequence
  useEffect(() => {
    splash1.value = withDelay(0, withTiming(1, { duration: 800 }));
    splash2.value = withDelay(600, withTiming(1, { duration: 800 }));
    splash3.value = withDelay(1200, withTiming(1, { duration: 800 }));
    splash4.value = withDelay(1800, withTiming(1, { duration: 800 }));
    splashMiddle.value = withDelay(2400, withTiming(1, { duration: 800 }));

    const timer = setTimeout(() => onFinish && onFinish(), 4000);
    return () => clearTimeout(timer);
  }, [onFinish, splash1, splash2, splash3, splash4, splashMiddle]);

  // Animated styles
  const style1 = useAnimatedStyle(() => ({ opacity: splash1.value }));
  const style2 = useAnimatedStyle(() => ({ opacity: splash2.value }));
  const style3 = useAnimatedStyle(() => ({ opacity: splash3.value }));
  const style4 = useAnimatedStyle(() => ({ opacity: splash4.value }));
  const styleMiddle = useAnimatedStyle(() => ({ opacity: splashMiddle.value }));

  return (
    <View className="absolute inset-0 flex-1 items-center justify-center bg-[#161B50]">
      {/* splash1 */}
      <Animated.Image
        source={require('@/assets/splash/splash1.png')}
        className="absolute bottom-3 right-52 z-10 h-80 w-80"
        resizeMode="contain"
        style={style1}
      />

      {/* splash2 */}
      <Animated.Image
        source={require('@/assets/splash/splash2.png')}
        className="bottom-30 absolute -right-9 z-10 h-96 w-auto"
        resizeMode="contain"
        style={style2}
      />

      {/* splash3 */}
      <Animated.Image
        source={require('@/assets/splash/splash3.png')}
        className="absolute -left-14 top-5 z-10 h-64 w-64"
        resizeMode="contain"
        style={style3}
      />

      {/* splash4 */}
      <Animated.Image
        source={require('@/assets/splash/splash4.png')}
        className="absolute -right-16 top-0 z-10 h-80 w-80"
        resizeMode="contain"
        style={style4}
      />

      {/* splash-middle (logo) */}
      <Animated.Image
        source={require('@/assets/splash/splash-middle.png')}
        className="z-10 h-72 w-72"
        resizeMode="contain"
        style={styleMiddle}
      />
    </View>
  );
}
