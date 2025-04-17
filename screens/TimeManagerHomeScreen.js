import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { useLocalization } from "../localization";
import { COLORS } from "../constants/colors";
import {
  getCurrentWeather,
  getWeatherForecast,
} from "../services/weatherService";

const TimeManagerHomeScreen = ({ navigation }) => {
  const { t } = useLocalization();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWorking, setIsWorking] = useState(false);
  const [workDuration, setWorkDuration] = useState(0);
  const [currentWeather, setCurrentWeather] = useState({
    temperature: 28,
    condition: "Sunny",
    icon: "sunny",
  });
  const [weatherForecast, setWeatherForecast] = useState([
    { time: "09:00", temperature: 29, condition: "Sunny", icon: "sunny" },
    {
      time: "12:00",
      temperature: 32,
      condition: "Partly Cloudy",
      icon: "partly-sunny",
    },
    { time: "15:00", temperature: 30, condition: "Cloudy", icon: "cloudy" },
  ]);

  // Cập nhật thời gian hiện tại mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isWorking) {
        setWorkDuration((prev) => prev + 1);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [isWorking]);

  // Format thời gian thành HH:MM
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // Format thời gian làm việc thành HH:MM
  const formatWorkDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
      .toString()
      .padStart(2, "0");
    const mins = (minutes % 60).toString().padStart(2, "0");
    return `${hours}:${mins}`;
  };

  // Lấy ngày hiện tại
  const getCurrentDate = () => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const day = days[currentTime.getDay()];
    const date = currentTime.getDate();
    const month = currentTime.getMonth() + 1;
    return `${day}, ${date}/${month}`;
  };

  // Xử lý khi nhấn nút "Đi làm"
  const handleWorkButton = () => {
    if (!isWorking) {
      setIsWorking(true);
      setWorkDuration(0);
    } else {
      setIsWorking(false);
    }
  };

  // Tạo dữ liệu cho trạng thái tuần
  const generateWeekData = () => {
    const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const today = new Date();
    const currentDay = today.getDay(); // 0 = CN, 1 = T2, ...
    const currentDate = today.getDate();

    // Tính ngày đầu tuần (T2)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(currentDate + mondayOffset);

    return days.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      // Xác định trạng thái của ngày
      let status = "none"; // none, worked, working, planned
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth()
      ) {
        status = isWorking ? "working" : "today";
      } else if (
        date.getDate() < today.getDate() &&
        date.getMonth() === today.getMonth()
      ) {
        status = "worked";
      } else if (index < 5) {
        // T2-T6 trong tương lai được lên kế hoạch
        status = "planned";
      }

      return {
        day,
        date: date.getDate(),
        status,
        workTime: status === "planned" ? "08:00 - 20:00" : null,
      };
    });
  };

  const weekData = generateWeekData();

  // Render icon trạng thái cho mỗi ngày
  const renderStatusIcon = (status) => {
    switch (status) {
      case "worked":
        return (
          <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
        );
      case "working":
        return (
          <View style={styles.workingIndicator}>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </View>
        );
      case "today":
        return <Ionicons name="alert-circle" size={24} color={COLORS.error} />;
      case "planned":
        return (
          <Ionicons name="close-circle" size={24} color={COLORS.darkGray} />
        );
      default:
        return (
          <Ionicons name="close-circle" size={24} color={COLORS.darkGray} />
        );
    }
  };

  // Render icon thời tiết
  const renderWeatherIcon = (icon) => {
    switch (icon) {
      case "sunny":
        return <Ionicons name="sunny" size={24} color={COLORS.warning} />;
      case "partly-sunny":
        return (
          <Ionicons name="partly-sunny" size={24} color={COLORS.warning} />
        );
      case "cloudy":
        return <Ionicons name="cloudy" size={24} color={COLORS.darkGray} />;
      case "rainy":
        return <Ionicons name="rainy" size={24} color={COLORS.info} />;
      default:
        return <Ionicons name="sunny" size={24} color={COLORS.warning} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0e17" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Time Manager</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bar-chart-2" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Time Section */}
        <View style={styles.timeSection}>
          <View>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.currentDate}>{getCurrentDate()}</Text>
          </View>

          {/* Shift Info */}
          <View style={styles.shiftInfoCard}>
            <View style={styles.shiftInfoHeader}>
              <Ionicons name="calendar-outline" size={20} color="#3498db" />
              <Text style={styles.shiftInfoTitle}>Ca Ngày</Text>
            </View>
            <Text style={styles.shiftTime}>08:00 → 20:00</Text>
          </View>
        </View>

        {/* Work Button */}
        <View style={styles.workButtonContainer}>
          <TouchableOpacity
            style={[styles.workButton, isWorking && styles.workingButton]}
            onPress={handleWorkButton}
          >
            <Ionicons name="navigate" size={28} color="white" />
            <Text style={styles.workButtonText}>Đi làm</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton}>
            <Ionicons name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Work Status */}
        <View style={styles.workStatusContainer}>
          <Text style={styles.workStatus}>
            {isWorking
              ? `Đã đi làm ${formatWorkDuration(workDuration)}`
              : "Chưa bắt đầu"}
          </Text>
        </View>

        {/* Week Status */}
        <View style={styles.weekStatusContainer}>
          <Text style={styles.sectionTitle}>Trạng thái tuần này</Text>

          <View style={styles.weekDaysHeader}>
            {weekData.map((item, index) => (
              <Text
                key={`day-${index}`}
                style={[
                  styles.weekDayText,
                  currentTime.getDay() === (index + 1) % 7 && styles.todayText,
                ]}
              >
                {item.day}
              </Text>
            ))}
          </View>

          <View style={styles.weekDaysHeader}>
            {weekData.map((item, index) => (
              <Text
                key={`date-${index}`}
                style={[
                  styles.weekDateText,
                  currentTime.getDay() === (index + 1) % 7 && styles.todayText,
                ]}
              >
                {item.date}
              </Text>
            ))}
          </View>

          <View style={styles.weekStatusRow}>
            {weekData.map((item, index) => (
              <View key={`status-${index}`} style={styles.weekStatusItem}>
                {renderStatusIcon(item.status)}
              </View>
            ))}
          </View>

          <View style={styles.weekTimeRow}>
            {weekData.map((item, index) => (
              <View key={`time-${index}`} style={styles.weekTimeItem}>
                {item.workTime && (
                  <>
                    <Text style={styles.weekTimeText}>08:00</Text>
                    <Text style={styles.weekTimeText}>-</Text>
                    <Text style={styles.weekTimeText}>20:00</Text>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Weather Forecast */}
        <View style={styles.weatherContainer}>
          <View style={styles.weatherHeader}>
            <Text style={styles.sectionTitle}>Thời tiết</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Weather")}>
              <Text style={styles.viewAllText}>Xem chi tiết</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.currentWeatherCard}>
            <View style={styles.weatherIconContainer}>
              {renderWeatherIcon(currentWeather.icon)}
            </View>
            <View style={styles.weatherInfoContainer}>
              <Text style={styles.temperatureText}>
                {currentWeather.temperature}°C
              </Text>
              <Text style={styles.conditionText}>
                {currentWeather.condition}
              </Text>
            </View>
          </View>

          <View style={styles.forecastContainer}>
            {weatherForecast.map((item, index) => (
              <View key={`forecast-${index}`} style={styles.forecastItem}>
                <Text style={styles.forecastTime}>{item.time}</Text>
                {renderWeatherIcon(item.icon)}
                <Text style={styles.forecastTemp}>{item.temperature}°C</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.notesContainer}>
          <View style={styles.notesTitleRow}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <TouchableOpacity
              style={styles.addNoteButton}
              onPress={() => navigation.navigate("Notes")}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addNoteText}>Thêm ghi chú</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyNotesContainer}>
            <Text style={styles.emptyNotesText}>Chưa có ghi chú nào</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0e17",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  timeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  currentTime: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  currentDate: {
    fontSize: 16,
    color: "#aaa",
  },
  shiftInfoCard: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    padding: 12,
    minWidth: 150,
  },
  shiftInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  shiftInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginLeft: 8,
  },
  shiftTime: {
    fontSize: 16,
    color: "#aaa",
  },
  workButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginVertical: 16,
  },
  workButton: {
    backgroundColor: "#8a2be2",
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  workingButton: {
    backgroundColor: "#9370db",
  },
  workButtonText: {
    color: "white",
    fontWeight: "bold",
    marginTop: 4,
  },
  resetButton: {
    position: "absolute",
    right: 80,
    backgroundColor: "#1a1f2c",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  workStatusContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  workStatus: {
    color: "#aaa",
    fontSize: 16,
  },
  weekStatusContainer: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  weekDaysHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekDayText: {
    color: "#aaa",
    width: 30,
    textAlign: "center",
  },
  weekDateText: {
    color: "#aaa",
    width: 30,
    textAlign: "center",
  },
  todayText: {
    color: "#e74c3c",
  },
  weekStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekStatusItem: {
    width: 30,
    alignItems: "center",
  },
  workingIndicator: {
    backgroundColor: "#3498db",
    borderRadius: 12,
  },
  weekTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weekTimeItem: {
    width: 40,
    alignItems: "center",
  },
  weekTimeText: {
    color: "#aaa",
    fontSize: 12,
  },
  weatherContainer: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  weatherHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#3498db",
    fontSize: 14,
  },
  currentWeatherCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  weatherIconContainer: {
    marginRight: 16,
  },
  weatherInfoContainer: {
    flex: 1,
  },
  temperatureText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  conditionText: {
    fontSize: 16,
    color: "#aaa",
  },
  forecastContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  forecastItem: {
    alignItems: "center",
    backgroundColor: "#252a37",
    borderRadius: 8,
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  forecastTime: {
    color: "#aaa",
    marginBottom: 8,
  },
  forecastTemp: {
    color: "white",
    fontWeight: "bold",
    marginTop: 8,
  },
  notesContainer: {
    backgroundColor: "#1a1f2c",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  notesTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addNoteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addNoteText: {
    color: "white",
    marginLeft: 4,
  },
  emptyNotesContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyNotesText: {
    color: "#aaa",
  },
});

export default TimeManagerHomeScreen;
