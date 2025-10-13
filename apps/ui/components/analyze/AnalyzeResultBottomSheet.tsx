import React, { useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  View,
  Text,
  PanResponder,
  Animated,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { AnalyzeSuccessResponse, AnalysisCard } from '@/utils/types/maps.types';

type AnalyzeResultBottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  status: 'loading' | 'success' | 'error';
  analysis?: AnalyzeSuccessResponse;
  errorMessage?: string | null;
  onRetry?: () => void;
  routeInfo?: {
    distance?: string;
    duration?: string;
  };
};

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MIN_SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;
const MAX_SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

type CategoryTheme = {
  border: string;
  background: string;
  dot: string;
  text: string;
};

const categoryThemes: Record<string, CategoryTheme> = {
  accessibility: {
    border: '#BBF7D0',
    background: '#F0FDF4',
    dot: '#22C55E',
    text: '#166534',
  },
  sidewalk: {
    border: '#DDD6FE',
    background: '#F5F3FF',
    dot: '#8B5CF6',
    text: '#5B21B6',
  },
  lighting: {
    border: '#BAE6FD',
    background: '#F0F9FF',
    dot: '#0EA5E9',
    text: '#075985',
  },
  crossing: {
    border: '#FBCFE8',
    background: '#FDF2F8',
    dot: '#EC4899',
    text: '#9D174D',
  },
  obstruction: {
    border: '#FDE68A',
    background: '#FFFBEB',
    dot: '#F59E0B',
    text: '#92400E',
  },
  traffic: {
    border: '#FCA5A5',
    background: '#FEF2F2',
    dot: '#EF4444',
    text: '#991B1B',
  },
  wayfinding: {
    border: '#BFDBFE',
    background: '#EFF6FF',
    dot: '#3B82F6',
    text: '#1D4ED8',
  },
};

const defaultTheme: CategoryTheme = {
  border: '#E5E7EB',
  background: '#F9FAFB',
  dot: '#6B7280',
  text: '#111827',
};

const getThemeForCard = (card: AnalysisCard): CategoryTheme => {
  return categoryThemes[card.category] ?? defaultTheme;
};

const renderSummary = (analysis: AnalyzeSuccessResponse | undefined) => {
  if (!analysis) return null;
  const { summary } = analysis;

  return (
    <View className="mb-4 rounded-2xl bg-[#EEF2FF] p-4">
      <Text className="font-inter-semibold text-lg text-[#1D4ED8]">
        {summary.label} · Skor {summary.score}
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-x-4 gap-y-2">
        {typeof summary.confidence === 'number' && (
          <View className="rounded-full bg-white/80 px-3 py-1">
            <Text className="font-inter-medium text-xs text-[#1F2937]">
              Keyakinan {Math.round(summary.confidence * 100)}%
            </Text>
          </View>
        )}
        {typeof summary.coveragePercent === 'number' && (
          <View className="rounded-full bg-white/80 px-3 py-1">
            <Text className="font-inter-medium text-xs text-[#1F2937]">
              Coverage {summary.coveragePercent}%
            </Text>
          </View>
        )}
        {summary.recencyBucket && (
          <View className="rounded-full bg-white/80 px-3 py-1">
            <Text className="font-inter-medium text-xs text-[#1F2937]">
              Recency {summary.recencyBucket}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const renderNotices = (analysis: AnalyzeSuccessResponse | undefined) => {
  if (!analysis?.notices?.length) return null;

  return (
    <View className="mb-4 gap-2">
      {analysis.notices.map((notice) => (
        <View
          key={notice.code}
          className="flex-row items-start gap-2 rounded-xl bg-[#FEFCE8] px-3 py-2">
          <Ionicons
            name={notice.severity === 'warning' ? 'alert-circle' : 'information-circle'}
            size={18}
            color={notice.severity === 'warning' ? '#EAB308' : '#3B82F6'}
          />
          <Text className="flex-1 font-inter-regular text-xs text-[#4B5563]">{notice.message}</Text>
        </View>
      ))}
    </View>
  );
};

const renderCards = (analysis: AnalyzeSuccessResponse | undefined) => {
  if (!analysis) return null;

  if (!analysis.cards?.length) {
    return (
      <View className="items-center justify-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-4 py-10">
        <Ionicons name="information-circle" size={24} color="#9CA3AF" />
        <Text className="mt-3 text-center font-inter-medium text-sm text-[#6B7280]">
          Analisis berhasil, namun tidak ada kartu rekomendasi yang dihasilkan.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {analysis.cards.map((card) => {
        const theme = getThemeForCard(card);

        return (
          <View
            key={card.id}
            style={{
              backgroundColor: theme.background,
              borderColor: theme.border,
            }}
            className="rounded-2xl border px-4 py-4">
            <View className="flex-row items-start gap-3">
              <View
                style={{ backgroundColor: theme.dot }}
                className="mt-0.5 h-3 w-3 rounded-full"
              />
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text
                    style={{ color: theme.text }}
                    className="font-inter-semibold flex-1 text-base"
                    numberOfLines={2}>
                    {card.title}
                  </Text>
                  {typeof card.score === 'number' && (
                    <View className="ml-3 rounded-full bg-white/70 px-2 py-1">
                      <Text className="font-inter-semibold text-xs text-[#111827]">
                        {card.score}
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="mt-2 font-inter-regular text-sm text-[#374151]">
                  {card.description}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const AnalyzeResultBottomSheet: React.FC<AnalyzeResultBottomSheetProps> = ({
  visible,
  onClose,
  status,
  analysis,
  errorMessage,
  onRetry,
  routeInfo,
}) => {
  // console.log("[AnalyzeSheet] render", {
  //   visible,
  //   status,
  //   hasAnalysis: !!analysis,
  //   cards: analysis?.cards?.length ?? 0,
  // });

  const translateY = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);

  // Reset position when modal becomes visible
  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
      lastGestureDy.current = 0;
    }
  }, [visible, translateY]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        translateY.setOffset(lastGestureDy.current);
      },
      onPanResponderMove: (_, gestureState) => {
        // Limit dragging: can't drag down beyond min height, can't drag up beyond max expansion
        const maxDragUp = -(MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT);
        const maxDragDown = 0;
        const newValue = Math.max(maxDragUp, Math.min(maxDragDown, gestureState.dy));
        translateY.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        translateY.flattenOffset();

        // Snap to positions
        const maxDragUp = -(MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT);

        if (gestureState.dy > 100) {
          // Swipe down to close
          onClose();
          Animated.timing(translateY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            lastGestureDy.current = 0;
          });
        } else if (gestureState.dy < -50) {
          // Swipe up to expand
          Animated.spring(translateY, {
            toValue: maxDragUp,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
          lastGestureDy.current = maxDragUp;
        } else {
          // Snap back to min height
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
          lastGestureDy.current = 0;
        }
      },
    })
  ).current;

  let sheetContent: React.ReactNode;

  if (status === 'loading') {
    sheetContent = (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#5572FF" />
        <Text className="mt-4 font-inter-medium text-sm text-[#4B5563]">Menganalisis rute...</Text>
      </View>
    );
  } else if (status === 'error') {
    sheetContent = (
      <View className="items-center justify-center py-10">
        <Ionicons name="warning" size={40} color="#F97316" />
        <Text className="mt-4 px-6 text-center font-inter-medium text-sm text-[#6B7280]">
          {errorMessage || 'Gagal menganalisis rute. Coba lagi nanti.'}
        </Text>
        {onRetry && (
          <Pressable onPress={onRetry} className="mt-5 rounded-full bg-[#5572FF] px-5 py-2.5">
            <Text className="font-inter-medium text-sm text-white">Coba lagi</Text>
          </Pressable>
        )}
      </View>
    );
  } else if (status === 'success' && analysis) {
    sheetContent = (
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}>
        {renderSummary(analysis)}
        {renderNotices(analysis)}
        {renderCards(analysis)}
      </ScrollView>
    );
  } else {
    // Fallback for when status is success but data hasn't loaded yet
    sheetContent = (
      <View className="items-center justify-center py-12">
        <ActivityIndicator size="large" color="#5572FF" />
        <Text className="mt-4 font-inter-medium text-sm text-[#4B5563]">Memuat hasil...</Text>
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent>
      <View className="flex-1 justify-end bg-black/30">
        <Pressable className="flex-1" onPress={onClose} />
        <Animated.View
          style={{
            minHeight: MIN_SHEET_HEIGHT,
            maxHeight: MAX_SHEET_HEIGHT,
            transform: [{ translateY }],
          }}
          className="flex rounded-t-[28px] bg-white px-6 pb-8 pt-4 shadow-lg">
          <View className="items-center" {...panResponder.panHandlers}>
            <View className="h-1.5 w-12 rounded-full bg-[#E5E7EB]" />
          </View>
          <View className="mt-4 flex-row items-center justify-between">
            <Text className="font-inter-semibold text-lg text-[#111827]">Hasil Analisis</Text>
            <Pressable
              onPress={onClose}
              className="h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6]">
              <Ionicons name="close" size={20} color="#4B5563" />
            </Pressable>
          </View>
          {routeInfo && (routeInfo.distance || routeInfo.duration) && (
            <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-[#F9FAFB] px-3 py-2">
              <Ionicons name="walk" size={16} color="#2563EB" />
              <Text className="font-inter-medium text-xs text-[#1F2937]">
                {routeInfo.distance ?? '-'}
              </Text>
              <Text className="font-inter-regular text-xs text-[#9CA3AF]">•</Text>
              <Text className="font-inter-medium text-xs text-[#1F2937]">
                {routeInfo.duration ?? '-'}
              </Text>
            </View>
          )}
          <View className="mt-4 flex-1 overflow-hidden">{sheetContent}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AnalyzeResultBottomSheet;
