import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { ReportHistoryItem } from '@/utils/types/beranda.types';
import { router } from 'expo-router';

const ReportDraftCardRiwayat = ({
  report,
}: {
  report: ReportHistoryItem;
  handleViewReportDetail: (reportId: string) => void;
}) => {
  return (
    <Card
      key={report.id}
      className="mt-2.5 rounded-xl !bg-white"
      style={{
        padding: 4,
      }}>
      <Card.Content style={{ padding: 0, margin: 0 }} className="!m-0 !p-0">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-medium text-base text-[#242528]">{report.title}</Text>
          <View className="rounded-[25px] bg-gray-300 px-3 py-1">
            <Text className="font-inter-medium text-sm text-gray-50">Draf</Text>
          </View>
        </View>
        <Text className="mt-1.5 font-inter-regular text-sm text-[#ABAFB5]">
          {report.date} • {report.location}
        </Text>

        <View className="mb-2 mt-4 h-[1px] bg-[#E5E5E5]" />

        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="font-inter-semibold text-xs text-[#ABAFB5]">Status</Text>
            <Text className="font-inter-semi-bold text-sm text-gray-300">-</Text>
          </View>

          <TouchableOpacity
            className="items-center justify-center rounded-lg bg-[#EBF4FF] px-4 py-2.5"
            onPress={() =>
              router.push({
                pathname: '/edit-draft-detail',
                params: {
                  id: report.id,
                  title: report.title,
                  location: report.location,
                  kategori: 'berat', // mock
                  adaDampak: 'ya', // mock
                  catatan: 'Pejalan kaki dapat tersandung', // mock
                  imageUris: JSON.stringify([
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
                  ]), // mock
                },
              })
            }>
            <Text className="font-inter-semi-bold text-sm text-[#2431AE]">Edit draf</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

export default ReportDraftCardRiwayat;
