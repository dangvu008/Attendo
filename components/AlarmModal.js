"use client";

import { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, Vibration } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { playAlarmSound, stopAlarmSound } from "../utils/alarmSoundUtils";
import { formatDate } from "../utils/dateUtils";
import { useLocalization } from "../localization";
import { alarmModalStyles } from "../styles/components/alarmModal";

const AlarmModal = ({
  visible,
  onDismiss,
  title,
  message,
  alarmSound = "alarm_1",
  vibrationEnabled = true,
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const { t } = useLocalization();

  // Phát âm thanh và rung khi modal hiển thị
  useEffect(() => {
    let interval;

    if (visible) {
      // Phát âm thanh
      playAlarmSound(alarmSound);

      // Rung nếu được bật
      if (vibrationEnabled) {
        // Rung theo mẫu: 500ms rung, 500ms nghỉ, lặp lại
        Vibration.vibrate([500, 500], true);
      }

      // Đếm thời gian đã hiển thị
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      // Dừng âm thanh và rung khi modal đóng
      stopAlarmSound();
      Vibration.cancel();
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
      stopAlarmSound();
      Vibration.cancel();
    };
  }, [visible, alarmSound, vibrationEnabled]);

  // Tự động đóng sau 5 phút nếu không có tương tác
  useEffect(() => {
    if (elapsedTime >= 300) {
      // 300 giây = 5 phút
      onDismiss();
    }
  }, [elapsedTime, onDismiss]);

  // Định dạng thời gian đã hiển thị
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={alarmModalStyles.modalOverlay}>
        <View style={alarmModalStyles.modalContent}>
          <View style={alarmModalStyles.alarmIcon}>
            <MaterialIcons name="alarm-on" size={48} color="#4A6572" />
          </View>

          <Text style={alarmModalStyles.title}>{title || t("alarm")}</Text>
          <Text style={alarmModalStyles.message}>
            {message || t("timeToWork")}
          </Text>
          <Text style={alarmModalStyles.time}>
            {formatDate(new Date(), "full")}
          </Text>
          <Text style={alarmModalStyles.elapsedTime}>
            {t("displayTime")}: {formatElapsedTime()}
          </Text>

          <TouchableOpacity
            style={alarmModalStyles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={alarmModalStyles.dismissButtonText}>
              {t("dismissAlarm")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AlarmModal;
