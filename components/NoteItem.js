import { View, Text, TouchableOpacity } from "react-native"
import { MaterialIcons } from "@expo/vector-icons"
import { useAppContext } from "../context/AppContext"
import { formatDate } from "../utils/dateUtils"
import { useTranslation } from "../i18n/useTranslation"
import { noteItemStyles } from "../styles/components/noteItem"

const NoteItem = ({ note, onEdit, onDelete }) => {
  const { getNextReminderDate, shifts } = useAppContext()
  const { t } = useTranslation()

  // Lấy thời gian nhắc nhở tiếp theo
  const nextReminderDate = getNextReminderDate(note)

  // Định dạng thời gian nhắc nhở
  const formatReminderTime = () => {
    if (!nextReminderDate) return note.reminderTime

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    // Kiểm tra xem có phải hôm nay không
    if (
      nextReminderDate.getDate() === today.getDate() &&
      nextReminderDate.getMonth() === today.getMonth() &&
      nextReminderDate.getFullYear() === today.getFullYear()
    ) {
      return `${t("notes.today")} ${note.reminderTime}`
    }

    // Kiểm tra xem có phải ngày mai không
    if (
      nextReminderDate.getDate() === tomorrow.getDate() &&
      nextReminderDate.getMonth() === tomorrow.getMonth() &&
      nextReminderDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return `${t("notes.tomorrow")} ${note.reminderTime}`
    }

    // Nếu không phải hôm nay hoặc ngày mai, hiển thị ngày đầy đủ
    return formatDate(nextReminderDate, "date") + " " + note.reminderTime
  }

  // Lấy tên các ca liên kết
  const getAssociatedShiftNames = () => {
    if (!note.associatedShiftIds || note.associatedShiftIds.length === 0) return ""

    const shiftNames = note.associatedShiftIds
      .map((id) => {
        const shift = shifts.find((s) => s.id === id)
        return shift ? shift.name : ""
      })
      .filter((name) => name !== "")

    return shiftNames.join(", ")
  }

  return (
    <View style={noteItemStyles.container}>
      <View style={noteItemStyles.content}>
        <Text style={noteItemStyles.title} numberOfLines={2} ellipsizeMode="tail">
          {note.title}
        </Text>

        <Text style={noteItemStyles.noteContent} numberOfLines={3} ellipsizeMode="tail">
          {note.content}
        </Text>

        <View style={noteItemStyles.reminderInfo}>
          <MaterialIcons name="access-time" size={14} color="#4A6572" />
          <Text style={noteItemStyles.reminderText}>
            {t("notes.nextReminder")}: {formatReminderTime()}
          </Text>
        </View>

        {note.associatedShiftIds && note.associatedShiftIds.length > 0 && (
          <View style={noteItemStyles.shiftInfo}>
            <MaterialIcons name="work" size={14} color="#4A6572" />
            <Text style={noteItemStyles.shiftText} numberOfLines={1} ellipsizeMode="tail">
              {getAssociatedShiftNames()}
            </Text>
          </View>
        )}
      </View>

      <View style={noteItemStyles.actions}>
        <TouchableOpacity style={noteItemStyles.actionButton} onPress={() => onEdit(note)}>
          <MaterialIcons name="edit" size={20} color="#4A6572" />
        </TouchableOpacity>

        <TouchableOpacity style={noteItemStyles.actionButton} onPress={() => onDelete(note)}>
          <MaterialIcons name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default NoteItem
