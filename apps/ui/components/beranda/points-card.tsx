import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Skeleton } from '../Skeleton';

interface PointsCardProps {
  isPending: boolean;
  points: number;
  onCreateReport: () => void;
}

const PointsCard = ({ isPending, points, onCreateReport }: PointsCardProps) => {
  return (
    <Card className="mt-2.5 rounded-2xl">
      <Card.Content className="flex-row items-center justify-between rounded-2xl bg-white">
        <View>
          <Text className="font-inter-medium text-sm text-[#242528]">Poin Jejak</Text>
          <View className="mt-1 flex-row items-center">
            <Image
              source={require('@/assets/Logo-green.png')}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
            {isPending ? (
              <Skeleton className="ml-1.5 text-lg font-bold text-[#242528]" width={50} />
            ) : (
              <Text className="ml-1.5 font-inter-medium text-2xl text-[#242528]">
                {points} poin
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          className="items-center justify-center rounded-[50px] bg-[#EBF4FF] px-[18px] py-2.5"
          onPress={onCreateReport}>
          <Text className="font-inter-semi-bold text-sm text-[#2431AE]">Buat Laporan</Text>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

export default PointsCard;
