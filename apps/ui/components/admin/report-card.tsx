import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from 'react-native-paper';
import { ReportHistoryItem } from '@/utils/types/beranda.types';

type Props = {
  report: ReportHistoryItem & {
    reporterName?: string;
    reporterImage?: string;
    severity?: 'Ringan' | 'Sedang' | 'Berat';
  };
  handleViewReportDetail: (reportId: string) => void;
  variant?: 'primary' | 'secondary';
};

const severityStyle = {
  Ringan: { bg: '#ECFDF3', color: '#027A48' },
  Sedang: { bg: '#FFFAEB', color: '#B54708' },
  Berat: { bg: '#FEF3F2', color: '#B42318' },
};

const ReportCard = ({ report, handleViewReportDetail, variant = 'primary' }: Props) => {
  const sev = report.severity ? severityStyle[report.severity] : null;

  return (
    <Card className="mt-2.5 rounded-xl !bg-white" style={{ padding: 8 }}>
      <Card.Content style={{ padding: 0, margin: 0 }}>
        {/* Status Badge */}
        <View className="flex-row mb-2">
          <View
            className="flex-row items-center rounded-full px-2.5 py-1"
            style={{ backgroundColor: report.statusBgColor }}>
            <View
              className="h-2 w-2 rounded-full mr-1.5"
              style={{ backgroundColor: report.statusColor }}
            />
            <Text className="font-inter-medium text-sm" style={{ color: report.statusColor }}>
              {report.status}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text className="font-inter-medium text-base text-[#242528]">{report.title}</Text>

        {/* Date + Location */}
        <Text
          className="mt-1.5 font-inter-regular text-sm text-[#ABAFB5]"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ maxWidth: 350 }}>
          {report.date} • {report.location}
        </Text>

        {/* Reporter Info */}
        {report.reporterName && (
          <View className="flex-row items-center mt-2">
            {report.reporterImage ? (
              <Image source={{ uri: report.reporterImage }} className="h-5 w-5 rounded-full mr-2" />
            ) : (
              <View className="h-5 w-5 rounded-full mr-2 bg-gray-300" />
            )}
            <Text
              className="text-sm text-gray-500"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ maxWidth: 280 }}>
              Dilaporkan oleh <Text className="font-inter-medium">{report.reporterName}</Text>
            </Text>
          </View>
        )}

        {/* Divider */}
        <View className="my-3 h-[1px] bg-[#E5E5E5]" />

        {/* Bottom Row */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-inter-semibold text-xs text-[#ABAFB5] mb-1">Keparahan</Text>
            {sev ? (
              <View className="rounded-lg px-3 py-1" style={{ backgroundColor: sev.bg }}>
                <Text className="font-inter-medium text-sm" style={{ color: sev.color }}>
                  {report.severity}
                </Text>
              </View>
            ) : (
              <Text className="font-inter-medium text-sm text-gray-500">-</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={() => handleViewReportDetail(report.id)}
            className={`items-center justify-center rounded-lg px-4 py-2.5 ${
              variant === 'primary' ? 'bg-[#1437B9]' : 'bg-[#EBF4FF]'
            }`}>
            <Text
              className={`font-inter-semi-bold text-sm ${
                variant === 'primary' ? 'text-[#F5F5F6]' : 'text-[#2431AE]'
              }`}>
              Lihat detail
            </Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

export default ReportCard;
