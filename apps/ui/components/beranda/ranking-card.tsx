import { View, Text, Image } from 'react-native';
import { Avatar } from 'react-native-paper';

interface RankingCardProps {
  user: {
    id: string;
    rank: number;
    name: string;
    avatar: string;
    points: number;
    isCurrentUser: boolean;
  };
}
const RankingCard = ({ user }: RankingCardProps) => {
  return (
    <View
      key={user.id}
      className={`mt-2 rounded-xl border p-3 py-4 ${
        user.isCurrentUser ? 'border-[#9DBDFF] bg-[#DCEAFF]' : 'border-[#E5E6E8] bg-[#F5F5F6]'
      }`}>
      <View className="flex-row items-center gap-4">
        <Text className="w-[25px] text-center text-base font-semibold text-[#2431AE]">
          {user.rank}
        </Text>
        <Avatar.Image size={35} source={{ uri: user.avatar }} />
        <View className="flex-1">
          <Text
            className={`font-inter-medium text-[12px] ${
              user.isCurrentUser ? 'text-[#2431AE]' : 'text-black'
            }`}>
            {user.name}
          </Text>
          <Text
            className={`mt-0.5 font-inter-regular text-[10px] ${
              user.isCurrentUser ? 'text-[#2431AE]' : 'text-gray-500'
            }`}>
            {user.points} Poin Jejak
          </Text>
        </View>
        <Image
          source={
            user.isCurrentUser
              ? require('../../assets/Logo-blue.png')
              : require('../../assets/Logo-gray.png')
          }
          className="h-7 w-5"
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default RankingCard;
