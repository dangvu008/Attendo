"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useAppContext } from "../context/AppContext"
import WeeklyStatusGrid from "../components/WeeklyStatusGrid"
import AlarmModal from "../components/AlarmModal"
import WeatherIcon from "../components/WeatherIcon"
import NoteItem from "../components/NoteItem"
import NoteForm from "../components/NoteForm"
import { formatDate, getDayOfWeek, timeToMinutes } from "../utils/dateUtils"
import { MaterialIcons } from "@expo/vector-icons"
import { useTranslation } from "../i18n/useTranslation"
import MultiButton from "../components/MultiButton"
import { homeScreenStyles } from "../styles/screens/homeScreen"
import Logo from "../components/Logo" // Import the Logo component

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
    getNextReminderDate,
  } = useAppContext()
  const { t } = useTranslation()

  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeShifts, setActiveShifts] = useState([])
  const [showAlarm, setShowAlarm] = useState(false)
  const [alarmData, setAlarmData] = useState({
    title: "",
    message: "",
    alarmSound: "alarm_1",
  })
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState(null)
  const [todayNotes, setTodayNotes] = useState([])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Find active shifts for today
  useEffect(() => {
    const today = getDayOfWeek(new Date())
    const todayShifts = shifts.filter((shift) => shift.daysApplied.includes(today))
    setActiveShifts(todayShifts)
  }, [shifts])

  // Lấy danh sách ghi chú cho ngày hôm nay
  useEffect(() => {
    const fetchTodayNotes = () => {
      // Lấy tất cả ghi chú cho ngày hôm nay
      const allTodayNotes = getNotesForToday()

      // Sắp xếp theo thời gian nhắc nhở gần nhất
      allTodayNotes.sort((a, b) => {
        const dateA = getNextReminderDate(a)
        const dateB = getNextReminderDate(b)

        // Nếu không có ngày nhắc nhở, sắp xếp theo updatedAt
        if (!dateA && !dateB) {
          return new Date(b.updatedAt) - new Date(a.updatedAt)
        }
        if (!dateA) return 1
        if (!dateB) return -1

        return dateA.getTime() - dateB.getTime()
      })

      // Chỉ lấy tối đa 3 ghi chú
      setTodayNotes(allTodayNotes.slice(0, 3))
    }

    fetchTodayNotes()
  }, [notes, shifts, getNotesForToday, getNextReminderDate])

  // Check for shift reminders
  useEffect(() => {
    if (activeShifts.length === 0 || !userSettings.alarmSoundEnabled) return

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    activeShifts.forEach((shift) => {
      const startMinutes = timeToMinutes(shift.startTime)
      const endMinutes = timeToMinutes(shift.endTime)

      // Check for start reminder
      if (Math.abs(currentMinutes - startMinutes) === shift.remindBeforeStart) {
        triggerAlarm(
          t("alarm.timeToWork"),
          t("alarm.shiftStartingSoon", { name: shift.name, minutes: shift.remindBeforeStart }),
          "alarm_1",
        )
      }

      // Check for end reminder
      if (Math.abs(currentMinutes - endMinutes) === shift.remindAfterEnd) {
        triggerAlarm(
          t("alarm.timeToWork"),
          t("alarm.shiftEndingSoon", { name: shift.name, minutes: shift.remindAfterEnd }),
          "alarm_2",
        )
      }
    })
  }, [currentTime, activeShifts, userSettings, t])

  // Trigger alarm
  const triggerAlarm = (title, message, alarmSound) => {
    setAlarmData({
      title,
      message,
      alarmSound,
    })
    setShowAlarm(true)
  }

  // Handle check-in
  const handleCheckIn = () => {
    if (activeShifts.length === 0) {
      Alert.alert(
        t("attendance.noShiftsToCheckIn"),
        t("attendance.noShiftsToCheckIn") + " " + t("shifts.addShiftPrompt"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("shifts.addShift"),
            onPress: () => navigation.navigate("Shifts", { screen: "ShiftDetail", params: { isNew: true } }),
          },
        ],
      )
      return
    }

    // If there's only one shift, use it directly
    if (activeShifts.length === 1) {
      recordAttendance(activeShifts[0].id, "check-in")
      return
    }

    // If there are multiple shifts, let the user choose
    Alert.alert(
      t("attendance.chooseShift"),
      t("attendance.multipleShiftsPrompt"),
      activeShifts.map((shift) => ({
        text: shift.name,
        onPress: () => recordAttendance(shift.id, "check-in"),
      })),
    )
  }

  // Handle check-out
  const handleCheckOut = () => {
    // Find shifts that have been checked in but not checked out
    const checkedInShifts = activeShifts.filter((shift) => {
      const today = new Date().toISOString().split("T")[0]

      const checkIns = attendanceRecords.filter(
        (record) => record.shiftId === shift.id && record.date.startsWith(today) && record.type === "check-in",
      )

      const checkOuts = attendanceRecords.filter(
        (record) => record.shiftId === shift.id && record.date.startsWith(today) && record.type === "check-out",
      )

      return checkIns.length > 0 && checkOuts.length === 0
    })

    if (checkedInShifts.length === 0) {
      Alert.alert(t("common.error"), t("attendance.needCheckInFirst"))
      return
    }

    // If there's only one shift, use it directly
    if (checkedInShifts.length === 1) {
      recordAttendance(checkedInShifts[0].id, "check-out")
      return
    }

    // If there are multiple shifts, let the user choose
    Alert.alert(
      t("attendance.chooseShift"),
      t("attendance.multipleCheckInsPrompt"),
      checkedInShifts.map((shift) => ({
        text: shift.name,
        onPress: () => recordAttendance(shift.id, "check-out"),
      })),
    )
  }

  // Record attendance
  const recordAttendance = (shiftId, type) => {
    const record = {
      shiftId,
      type,
      date: new Date().toISOString(),
    }

    addAttendanceRecord(record)

    Alert.alert(
      type === "check-in" ? t("attendance.checkInSuccess") : t("attendance.checkOutSuccess"),
      `${type === "check-in" ? t("attendance.checkInSuccess") : t("attendance.checkOutSuccess")} ${formatDate(new Date(), "time")}`,
    )
  }

  // Handle day press on weekly grid
  const handleDayPress = (date) => {
    navigation.navigate("CheckInOut", { date: date.toISOString() })
  }

  // Get today's attendance status
  const getTodayAttendanceStatus = () => {
    const today = new Date().toISOString().split("T")[0]

    const checkIns = attendanceRecords.filter((record) => record.date.startsWith(today) && record.type === "check-in")

    const checkOuts = attendanceRecords.filter((record) => record.date.startsWith(today) && record.type === "check-out")

    if (checkIns.length === 0) {
      return t("home.checkInStatus.notCheckedIn")
    } else if (checkOuts.length === 0) {
      return t("home.checkInStatus.checkedInNotOut")
    } else {
      return t("home.checkInStatus.checkedInAndOut")
    }
  }

  // Xử lý thêm ghi chú mới
  const handleAddNote = () => {
    setNoteToEdit(null)
    setShowNoteForm(true)
  }

  // Xử lý sửa ghi chú
  const handleEditNote = (note) => {
    setNoteToEdit(note)
    setShowNoteForm(true)
  }

  // Xử lý xóa ghi chú
  const handleDeleteNote = (note) => {
    Alert.alert(t("common.confirm"), t("notes.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        onPress: () => deleteNote(note.id),
        style: "destructive",
      },
    ])
  }

  // Xử lý xem tất cả ghi chú
  const handleViewAllNotes = () => {
    navigation.navigate("Notes")
  }

  return (
    <View style={homeScreenStyles.container}>
      <ScrollView>
        <View style={homeScreenStyles.header}>
          {/* Add Logo at the top of the header */}
          <Logo size="small" showText={true} style={{ marginBottom: 8 }} />
          <Text style={homeScreenStyles.date}>{formatDate(currentTime, "date")}</Text>
          <Text style={homeScreenStyles.time}>{formatDate(currentTime, "time")}</Text>
          <Text style={homeScreenStyles.status}>{getTodayAttendanceStatus()}</Text>
        </View>

        <View style={homeScreenStyles.actionButtons}>
          <TouchableOpacity style={homeScreenStyles.actionButton} onPress={handleCheckIn}>
            <MaterialIcons name="login" size={24} color="#FFFFFF" />
            <Text style={homeScreenStyles.actionButtonText}>{t("attendance.checkIn")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[homeScreenStyles.actionButton, homeScreenStyles.checkOutButton]}
            onPress={handleCheckOut}
          >
            <MaterialIcons name="logout" size={24} color="#FFFFFF" />
            <Text style={homeScreenStyles.actionButtonText}>{t("attendance.checkOut")}</Text>
          </TouchableOpacity>
        </View>

        {/* Nút Đa Năng */}
        <MultiButton />

        <View style={homeScreenStyles.section}>
          <Text style={homeScreenStyles.sectionTitle}>{t("home.weeklySchedule")}</Text>
          <WeeklyStatusGrid onDayPress={handleDayPress} />
        </View>

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
            <View style={homeScreenStyles.emptyState}>
              <Text style={homeScreenStyles.emptyText}>{t("home.noShiftsToday")}</Text>
              <TouchableOpacity
                style={homeScreenStyles.addButton}
                onPress={() => navigation.navigate("Shifts", { screen: "ShiftDetail", params: { isNew: true } })}
              >
                <Text style={homeScreenStyles.addButtonText}>{t("home.addNewShift")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Khu vực ghi chú */}
        <View style={homeScreenStyles.section}>
          <View style={homeScreenStyles.sectionHeader}>
            <Text style={homeScreenStyles.sectionTitle}>{t("home.notes")}</Text>
            <View style={homeScreenStyles.noteActions}>
              <TouchableOpacity style={homeScreenStyles.viewAllButton} onPress={handleViewAllNotes}>
                <Text style={homeScreenStyles.viewAllText}>{t("common.viewAll")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={homeScreenStyles.addNoteButton} onPress={handleAddNote}>
                <MaterialIcons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {todayNotes.length > 0 ? (
            todayNotes.map((note) => (
              <NoteItem key={note.id} note={note} onEdit={handleEditNote} onDelete={handleDeleteNote} />
            ))
          ) : (
            <View style={homeScreenStyles.emptyState}>
              <Text style={homeScreenStyles.emptyText}>{t("notes.noNotes")}</Text>
              <TouchableOpacity style={homeScreenStyles.addButton} onPress={handleAddNote}>
                <Text style={homeScreenStyles.addButtonText}>{t("notes.addNotePrompt")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {weatherData && userSettings.weatherWarningEnabled && (
          <View style={homeScreenStyles.section}>
            <Text style={homeScreenStyles.sectionTitle}>{t("home.weather")}</Text>
            <View style={homeScreenStyles.weatherCard}>
              <Text style={homeScreenStyles.weatherLocation}>{weatherData.location}</Text>
              <View style={homeScreenStyles.weatherInfo}>
                <WeatherIcon iconCode={weatherData.icon} size={50} />
                <View style={homeScreenStyles.weatherTextInfo}>
                  <Text style={homeScreenStyles.weatherTemp}>{weatherData.temperature}°C</Text>
                  <Text style={homeScreenStyles.weatherDesc}>{weatherData.description}</Text>
                </View>
              </View>
              {weatherData.warning && (
                <View style={homeScreenStyles.warningBox}>
                  <MaterialIcons name="warning" size={20} color="#FFC107" />
                  <Text style={homeScreenStyles.warningText}>{weatherData.warning}</Text>
                </View>
              )}
            </View>
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
          setShowNoteForm(false)
          setNoteToEdit(null)
        }}
        noteToEdit={noteToEdit}
      />
    </View>
  )
}

export default HomeScreen
