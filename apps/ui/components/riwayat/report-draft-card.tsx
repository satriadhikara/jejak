import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { ReportHistoryItem } from '@/utils/types/beranda.types';
import { router } from 'expo-router';
import type { UserReport } from '@/utils/types/riwayat.types';

const ReportDraftCardRiwayat = ({
  report,
}: {
  report: ReportHistoryItem | UserReport;
  handleViewReportDetail: (reportId: string) => void;
}) => {
  // Determine if this is a UserReport or ReportHistoryItem
  const isUserReport = (obj: any): obj is UserReport => 'damageCategory' in obj;

  const reportId = report.id;
  const title = report.title;
  const location = isUserReport(report)
    ? report.locationName
    : (report as ReportHistoryItem).location;
  const date = isUserReport(report)
    ? new Date(report.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : (report as ReportHistoryItem).date;

  return (
    <Card
      key={reportId}
      className="mt-2.5 rounded-xl !bg-white"
      style={{
        padding: 4,
      }}>
      <Card.Content style={{ padding: 0, margin: 0 }} className="!m-0 !p-0">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-medium text-base text-[#242528]">{title}</Text>
          <View className="rounded-[25px] bg-gray-300 px-3 py-1">
            <Text className="font-inter-medium text-sm text-gray-50">Draf</Text>
          </View>
        </View>
        <Text className="mt-1.5 font-inter-regular text-sm text-[#ABAFB5]">
          {date} • {location}
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
                  id: reportId,
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
