import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useAppContext } from "../../context/optimized/AppContext";
import WeeklyStatusGrid from "../../components/WeeklyStatusGrid";
import AlarmModal from "../../components/AlarmModal";
import WeatherIcon from "../../components/WeatherIcon";
import NoteItem from "../../components/NoteItem";
import NoteForm from "../../components/NoteForm";
import { formatDate, getDayOfWeek, timeToMinutes } from "../../utils/dateUtils";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "../../i18n/useTranslation-optimized";
import MultiButton from "../../components/optimized/MultiButton";
import { homeScreenStyles } from "../../styles/screens/homeScreen";
import Logo from "../../components/Logo";

// Tối ưu hóa component con với React.memo
const Header = React.memo(({ currentTime, attendanceStatus }) => (
  <View style={homeScreenStyles.header}>
    <Logo size="small" showText={true} style={{ marginBottom: 8 }} />
    <Text style={homeScreenStyles.date}>{formatDate(currentTime, "date")}</Text>
    <Text style={homeScreenStyles.time}>{formatDate(currentTime, "time")}</Text>
    <Text style={homeScreenStyles.status}>{attendanceStatus}</Text>
  </View>
));

const WeatherCard = React.memo(({ weatherData, onPress }) => {
  if (!weatherData) return null;
  
  return (
    <TouchableOpacity style={homeScreenStyles.weatherCard} onPress={onPress}>
      <View style={homeScreenStyles.weatherHeader}>
        <Text style={homeScreenStyles.weatherTitle}>{weatherData.location}</Text>
        <WeatherIcon condition={weatherData.condition} size={32} />
      </View>
      <Text style={homeScreenStyles.weatherTemp}>{weatherData.temperature}°C</Text>
      <Text style={homeScreenStyles.weatherCondition}>{weatherData.condition}</Text>
      {weatherData.warning && (
        <View style={homeScreenStyles.warningContainer}>
          <MaterialIcons name="warning" size={16} color="#FF9800" />
          <Text style={homeScreenStyles.warningText}>{weatherData.warning}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const EmptyState = React.memo(({ text, buttonText, onPress }) => (
  <View style={homeScreenStyles.emptyState}>
    <Text style={homeScreenStyles.emptyText}>{text}</Text>
    <TouchableOpacity style={homeScreenStyles.addButton} onPress={onPress}>
      <Text style={homeScreenStyles.addButtonText}>{buttonText}</Text>
    </TouchableOpacity>
  </View>
));

const HomeScreen = ({ navigation }) => {
  const {
    userSettings,
    shifts,
    attendanceRecords,
    weatherData,
    addAttendanceRecord,
    notes,
    deleteNote,
    getNotesForToday,
  } = useAppContext();
  const { t } = useTranslation();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeShifts, setActiveShifts] = useState([]);
  const [showAlarm, setShowAlarm] = useState(false);
  const [alarmData, setAlarmData] = useState({
    title: "",
    message: "",
    alarmSound: "alarm_1",
  });
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);

  // Tối ưu hóa các hàm với useCallback
  const updateCurrentTime = useCallback(() => {
    setCurrentTime(new Date());
  }, []);

  const updateActiveShifts = useCallback(() => {
    const today = new Date();
    const dayOfWeek = getDayOfWeek(today).toLowerCase();
    
    const todayShifts = shifts.filter((shift) => {
      return shift.daysApplied && shift.daysApplied.includes(dayOfWeek);
    });
    
    setActiveShifts(todayShifts);
  }, [shifts]);

  const getTodayAttendanceStatus = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    
    const todayRecords = attendanceRecords.filter((record) => {
      return record.date && record.date.startsWith(today);
    });
    
    if (todayRecords.length === 0) {
      return t("home.checkInStatus.notCheckedIn");
    }
    
    const hasCheckIn = todayRecords.some((record) => record.type === "check-in");
    const hasCheckOut = todayRecords.some((record) => record.type === "check-out");
    
    if (hasCheckIn && hasCheckOut) {
      return t("home.checkInStatus.checkedInAndOut");
    } else if (hasCheckIn) {
      return t("home.checkInStatus.checkedInNotOut");
    } else {
      return t("home.checkInStatus.notCheckedIn");
    }
  }, [attendanceRecords, t]);

  const handleDayPress = useCallback((date) => {
    navigation.navigate("CheckInOut", { date: date.toISOString() });
  }, [navigation]);

  const handleWeatherPress = useCallback(() => {
    navigation.navigate("Weather");
  }, [navigation]);

  const recordAttendance = useCallback((shiftId, type) => {
    const record = {
      shiftId,
      type,
      date: new Date().toISOString(),
    };

    addAttendanceRecord(record);

    Alert.alert(
      type === "check-in" ? t("attendance.checkInSuccess") : t("attendance.checkOutSuccess"),
      `${type === "check-in" ? t("attendance.checkInSuccess") : t("attendance.checkOutSuccess")} ${formatDate(new Date(), "time")}`,
    );
  }, [addAttendanceRecord, t]);

  const handleAddNote = useCallback(() => {
    setNoteToEdit(null);
    setShowNoteForm(true);
  }, []);

  const handleEditNote = useCallback((note) => {
    setNoteToEdit(note);
    setShowNoteForm(true);
  }, []);

  const handleDeleteNote = useCallback((noteId) => {
    Alert.alert(
      t("notes.deleteConfirm"),
      t("notes.deleteConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          onPress: () => deleteNote(noteId),
          style: "destructive",
        },
      ],
    );
  }, [t, deleteNote]);

  // Sử dụng useMemo để tối ưu hóa các giá trị tính toán
  const todayNotes = useMemo(() => getNotesForToday(), [getNotesForToday]);
  const attendanceStatus = useMemo(() => getTodayAttendanceStatus(), [getTodayAttendanceStatus]);

  // Tối ưu hóa các side effects
  useEffect(() => {
    // Cập nhật thời gian mỗi phút
    const timer = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(timer);
  }, [updateCurrentTime]);

  useEffect(() => {
    updateActiveShifts();
  }, [shifts, updateActiveShifts]);

  // Render tối ưu
  const renderShiftSection = useMemo(() => (
    <View style={homeScreenStyles.section}>
      <Text style={homeScreenStyles.sectionTitle}>{t("home.todayShifts")}</Text>
      {activeShifts.length > 0 ? (
        activeShifts.map((shift) => (
          <TouchableOpacity
            key={shift.id}
            style={homeScreenStyles.shiftCard}
            onPress={() => navigation.navigate("Shifts", { screen: "ShiftDetail", params: { shiftId: shift.id } })}
          >
            <View style={homeScreenStyles.shiftHeader}>
              <Text style={homeScreenStyles.shiftName}>{shift.name}</Text>
              <MaterialIcons name="access-time" size={18} color="#4A6572" />
            </View>
            <View style={homeScreenStyles.shiftTimes}>
              <Text style={homeScreenStyles.shiftTime}>
                <MaterialIcons name="login" size={16} color="#4CAF50" /> {shift.startTime}
              </Text>
              <Text style={homeScreenStyles.shiftTime}>
                <MaterialIcons name="logout" size={16} color="#F44336" /> {shift.endTime}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <EmptyState
          text={t("home.noShiftsToday")}
          buttonText={t("home.addNewShift")}
          onPress={() => navigation.navigate("Shifts", { screen: "ShiftDetail" })}
        />
      )}
    </View>
  ), [activeShifts, t, navigation]);

  const renderWeeklySection = useMemo(() => (
    <View style={homeScreenStyles.section}>
      <Text style={homeScreenStyles.sectionTitle}>{t("home.weeklySchedule")}</Text>
      <WeeklyStatusGrid
        shifts={shifts}
        attendanceRecords={attendanceRecords}
        onDayPress={handleDayPress}
        firstDayOfWeek={userSettings.firstDayOfWeek}
      />
    </View>
  ), [shifts, attendanceRecords, handleDayPress, userSettings.firstDayOfWeek, t]);

  const renderNotesSection = useMemo(() => (
    <View style={homeScreenStyles.section}>
      <View style={homeScreenStyles.sectionHeader}>
        <Text style={homeScreenStyles.sectionTitle}>{t("home.notes")}</Text>
        <TouchableOpacity onPress={handleAddNote}>
          <MaterialIcons name="add" size={24} color="#4A6572" />
        </TouchableOpacity>
      </View>
      
      {todayNotes.length > 0 ? (
        todayNotes.map((note) => (
          <NoteItem 
            key={note.id} 
            note={note} 
            onEdit={handleEditNote} 
            onDelete={handleDeleteNote} 
          />
        ))
      ) : (
        <EmptyState
          text={t("notes.noNotes")}
          buttonText={t("notes.addNotePrompt")}
          onPress={handleAddNote}
        />
      )}
    </View>
  ), [todayNotes, t, handleAddNote, handleEditNote, handleDeleteNote]);

  return (
    <View style={homeScreenStyles.container}>
      <ScrollView>
        <Header currentTime={currentTime} attendanceStatus={attendanceStatus} />
        
        <MultiButton
          status="not_started"
          onGoWork={() => recordAttendance(activeShifts[0]?.id, "go-work")}
          onCheckIn={() => recordAttendance(activeShifts[0]?.id, "check-in")}
          onCheckOut={() => recordAttendance(activeShifts[0]?.id, "check-out")}
          onComplete={() => recordAttendance(activeShifts[0]?.id, "complete")}
        />
        
        {renderShiftSection}
        {renderWeeklySection}
        {renderNotesSection}
        
        {weatherData && (
          <View style={homeScreenStyles.section}>
            <Text style={homeScreenStyles.sectionTitle}>{t("home.weather")}</Text>
            <WeatherCard weatherData={weatherData} onPress={handleWeatherPress} />
          </View>
        )}
      </ScrollView>

      <AlarmModal
        visible={showAlarm}
        onDismiss={() => setShowAlarm(false)}
        title={alarmData.title}
        message={alarmData.message}
        alarmSound={alarmData.alarmSound}
        vibrationEnabled={userSettings.alarmVibrationEnabled}
      />

      <NoteForm
        visible={showNoteForm}
        onClose={() => {
          setShowNoteForm(false);
          setNoteToEdit(null);
        }}
        noteToEdit={noteToEdit}
      />
    </View>
  );
};

export default React.memo(HomeScreen);
