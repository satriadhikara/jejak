import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Avatar, Card } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useSessionContext } from "@/lib/session-context";

const reportHistory = [
  {
    id: 1,
    title: "Kerusakan Trotoar ITB Ganesha",
    date: "3 Oktober 2025",
    location: "Jl. Ganesa No.10, Lb. Siliwangi...",
    status: "Diperiksa",
    statusColor: "#717680",
    statusBgColor: "#F5F5F6",
  },
  {
    id: 2,
    title: "Kerusakan Trotoar ITB Ganesha",
    date: "3 Oktober 2025",
    location: "Jl. Ganesa No.10, Lb. Siliwangi...",
    status: "Dikonfirmasi",
    statusColor: "#2196F3",
    statusBgColor: "#2196F320",
  },
];

const rankings = [
  {
    id: 1,
    rank: 1,
    name: "WangXiaoXia",
    avatar: "https://i.pravatar.cc/150?img=12",
    points: 150,
    isCurrentUser: false,
  },
  {
    id: 2,
    rank: 2,
    name: "Lee Beu-li",
    avatar: "https://i.pravatar.cc/150?img=18",
    points: 150,
    isCurrentUser: false,
  },
  {
    id: 3,
    rank: 24,
    name: "You",
    avatar: "https://i.pravatar.cc/150?img=47",
    points: 150,
    isCurrentUser: true,
  },
];

export default function Home() {
  const session = useSessionContext();

  const userData = {
    name: session.user.name,
    avatar: session.user.image,
    points: 150, // This should come from your backend/database
  };

  const handleCreateReport = () => {
    // Handle create report navigation
    console.log("Navigate to create report");
  };

  const handleViewAllReports = () => {
    // Handle view all reports navigation
    console.log("Navigate to all reports");
  };

  const handleViewReportDetail = (reportId: number) => {
    // Handle view report detail navigation
    console.log("Navigate to report detail:", reportId);
  };

  const handleViewAllRankings = () => {
    // Handle view all rankings navigation
    console.log("Navigate to all rankings");
  };

  return (
    <View style={styles.wrapper}>
      <Image
        source={require("../../../assets/berandaBG.png")}
        style={styles.topImage}
        resizeMode="cover"
      />

      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                Halo, <Text style={styles.name}>{userData.name}</Text>!👋
              </Text>
            </View>
            <Avatar.Image size={40} source={{ uri: userData.avatar }} />
          </View>

          <Card style={styles.pointsCard}>
            <Card.Content style={styles.pointsContent}>
              <View>
                <Text style={styles.pointsLabel}>Poin Jejak</Text>
                <View style={styles.pointsRow}>
                  <Ionicons
                    name="footsteps-outline"
                    size={20}
                    color="#00D996"
                  />
                  <Text style={styles.pointsValue}>{userData.points} poin</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={handleCreateReport}
              >
                <Text style={styles.reportButtonText}>Buat Laporan</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Laporanmu</Text>
            <TouchableOpacity onPress={handleViewAllReports}>
              <Text style={styles.linkText}>Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {reportHistory.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              <Card.Content>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDate}>
                  {report.date} • {report.location}
                </Text>
                <View style={styles.separator} />
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: report.statusBgColor },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: report.statusColor }]}
                    >
                      {report.status}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => handleViewReportDetail(report.id)}
                  >
                    <Text style={styles.detailButtonText}>Lihat detail</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
          ))}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Peringkat</Text>
            <TouchableOpacity onPress={handleViewAllRankings}>
              <Text style={styles.linkText}>Lihat semua</Text>
            </TouchableOpacity>
          </View>

          {rankings.map((user) => (
            <View
              key={user.id}
              style={[styles.rankCard, user.isCurrentUser && styles.youCard]}
            >
              <View style={styles.rankRow}>
                <Text style={styles.rankNumber}>{user.rank}</Text>
                <Avatar.Image size={35} source={{ uri: user.avatar }} />
                <Text
                  style={user.isCurrentUser ? styles.myName : styles.rankName}
                >
                  {user.name}
                </Text>
                <Text style={styles.rankPoints}>{user.points} Poin Jejak</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
    backgroundColor: "#FAFAFB",
  },
  topImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 158,
    zIndex: 1,
  },
  container: {
    backgroundColor: "transparent",
    flex: 1,
    zIndex: 2,
  },
  contentContainer: {
    backgroundColor: "transparent",
    marginTop: 35,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "500",
    color: "#FFF",
  },
  name: {
    color: "#00D996",
    fontWeight: "600",
  },
  pointsCard: {
    marginTop: 10,
    borderRadius: 16,
  },
  pointsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  pointsLabel: {
    color: "#242528",
    fontSize: 10,
  },
  pointsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#242528",
    marginLeft: 6,
  },
  reportButton: {
    backgroundColor: "#EBF4FF",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  reportButtonText: {
    color: "#2431AE",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#242528",
    fontWeight: "600",
  },
  linkText: {
    color: "#3848F4",
  },
  reportCard: {
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  reportDate: {
    color: "#777",
    marginVertical: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 12,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 25,
  },
  statusText: {
    fontWeight: "600",
    color: "#717680",
  },
  detailButton: {
    backgroundColor: "#1437B9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  detailButtonText: {
    color: "#F5F5F6",
    fontSize: 12,
    fontWeight: "500",
  },
  rankCard: {
    backgroundColor: "#F5F5F6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E6E8",
    padding: 12,
    marginTop: 8,
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: "600",
    width: 25,
    textAlign: "center",
    color: "#2431AE",
  },
  rankName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  myName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#2431AE",
  },
  rankPoints: {
    color: "#2431AE",
    fontSize: 13,
  },
  youCard: {
    backgroundColor: "#DCEAFF",
    borderWidth: 1,
    borderColor: "#9DBDFF",
  },
});
