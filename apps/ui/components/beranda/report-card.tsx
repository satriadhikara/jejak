import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { ReportHistoryItem } from '@/utils/types/beranda.types';

const ReportCard = ({
  report,
  handleViewReportDetail,
}: {
  report: ReportHistoryItem;
  handleViewReportDetail: (reportId: number) => void;
}) => {
  return (
    <Card
      key={report.id}
      className="mt-2.5 rounded-xl !bg-white"
      style={{
        padding: 4,
      }}>
      <Card.Content style={{ padding: 0, margin: 0 }} className="!m-0 !p-0">
        <Text className="font-inter-medium text-base text-[#242528]">{report.title}</Text>
        <Text className="mt-1.5 font-inter-regular text-sm text-[#ABAFB5]">
          {report.date} • {report.location}
        </Text>

        <View className="mb-2 mt-4 h-[1px] bg-[#E5E5E5]" />

        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="font-inter-semibold text-xs text-[#ABAFB5]">Status</Text>
            <View
              className="rounded-[25px] px-3 py-1"
              style={{ backgroundColor: report.statusBgColor }}>
              <Text className="font-inter-medium text-sm" style={{ color: report.statusColor }}>
                {report.status}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="items-center justify-center rounded-lg bg-[#1437B9] px-4 py-2.5"
            onPress={() => handleViewReportDetail(report.id)}>
            <Text className="font-inter-semi-bold text-sm text-[#F5F5F6]">Lihat detail</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

export default ReportCard;
