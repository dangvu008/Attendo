import { View, Text, TouchableOpacity } from "react-native"
import { useAppContext } from "../context/AppContext"
import { getDayOfWeek, isToday, getWeekDates } from "../utils/dateUtils"
import { weeklyStatusGridStyles } from "../styles/components/weeklyStatusGrid"

const WeeklyStatusGrid = ({ onDayPress }) => {
  const { userSettings, shifts, attendanceRecords } = useAppContext()
  const today = new Date()
  const { startOfWeek } = getWeekDates(today, userSettings.firstDayOfWeek)

  // Generate array of dates for the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  // Get short day names based on first day of week
  const getDayNames = () => {
    const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
    if (userSettings.firstDayOfWeek === "Mon") {
      return [...days.slice(1), days[0]]
    }
    return days
  }

  const dayNames = getDayNames()

  // Check if a shift is scheduled for a specific date
  const isShiftScheduled = (date) => {
    const dayOfWeek = getDayOfWeek(date)
    return shifts.some((shift) => shift.daysApplied.includes(dayOfWeek))
  }

  // Check if there's an attendance record for a specific date
  const getAttendanceStatus = (date) => {
    const dateStr = date.toISOString().split("T")[0]

    const records = attendanceRecords.filter((record) => record.date.startsWith(dateStr))

    if (records.length === 0) {
      return null
    }

    // Check if there's both check-in and check-out
    const hasCheckIn = records.some((record) => record.type === "check-in")
    const hasCheckOut = records.some((record) => record.type === "check-out")

    if (hasCheckIn && hasCheckOut) {
      return "complete"
    } else if (hasCheckIn) {
      return "partial"
    } else {
      return null
    }
  }

  return (
    <View style={weeklyStatusGridStyles.container}>
      <View style={weeklyStatusGridStyles.headerRow}>
        {dayNames.map((day, index) => (
          <View key={`header-${index}`} style={weeklyStatusGridStyles.headerCell}>
            <Text style={weeklyStatusGridStyles.headerText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={weeklyStatusGridStyles.daysRow}>
        {weekDays.map((date, index) => {
          const scheduled = isShiftScheduled(date)
          const attendanceStatus = getAttendanceStatus(date)
          const isCurrentDay = isToday(date)

          return (
            <TouchableOpacity
              key={`day-${index}`}
              style={[
                weeklyStatusGridStyles.dayCell,
                isCurrentDay && weeklyStatusGridStyles.currentDay,
                scheduled && weeklyStatusGridStyles.scheduledDay,
                attendanceStatus === "complete" && weeklyStatusGridStyles.completeDay,
                attendanceStatus === "partial" && weeklyStatusGridStyles.partialDay,
              ]}
              onPress={() => onDayPress(date)}
            >
              <Text
                style={[
                  weeklyStatusGridStyles.dayText,
                  isCurrentDay && weeklyStatusGridStyles.currentDayText,
                  (scheduled || attendanceStatus) && weeklyStatusGridStyles.activeDayText,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default WeeklyStatusGrid
