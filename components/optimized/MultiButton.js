import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAppContext } from "../../context/AppContext";
import { useTranslation } from "../../i18n/simple-useTranslation";
import { COLORS } from "../../constants/colors";

// Tối ưu hóa component con với React.memo
const LogItem = React.memo(({ icon, text, time, isActive }) => {
  return (
    <View style={[styles.logItem, isActive && styles.activeLogItem]}>
      <MaterialIcons name={icon} size={16} color={COLORS.primary} />
      <Text style={styles.logText}>{text}</Text>
      {time && <Text style={styles.logTime}>{time}</Text>}
    </View>
  );
});

const MultiButton = ({
  onGoWork,
  onCheckIn,
  onPunch,
  onCheckOut,
  onComplete,
  status = "not_started",
  showLogs = false,
  logs = [],
}) => {
  const { userSettings } = useAppContext();
  const { t } = useTranslation();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [workDuration, setWorkDuration] = useState(0);
  const [isLogsVisible, setIsLogsVisible] = useState(showLogs);
  const [isPulsing, setIsPulsing] = useState(false);

  // Refs for animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const logsContainerHeight = useRef(new Animated.Value(0)).current;
  const workTimer = useRef(null);

  // Memoize các giá trị tính toán
  const buttonMode = useMemo(
    () => userSettings?.multiButtonMode || "full",
    [userSettings?.multiButtonMode]
  );
  const hapticEnabled = useMemo(
    () => userSettings?.hapticFeedbackEnabled !== false,
    [userSettings?.hapticFeedbackEnabled]
  );

  // Tối ưu hóa các hàm với useCallback
  const triggerHapticFeedback = useCallback(() => {
    if (hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [hapticEnabled]);

  const startPulseAnimation = useCallback(() => {
    setIsPulsing(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const stopPulseAnimation = useCallback(() => {
    setIsPulsing(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  const startWorkDurationTimer = useCallback(() => {
    if (workTimer.current) clearInterval(workTimer.current);

    setWorkDuration(0);
    workTimer.current = setInterval(() => {
      setWorkDuration((prev) => prev + 1);
    }, 60000); // Update every minute
  }, []);

  const stopWorkDurationTimer = useCallback(() => {
    if (workTimer.current) {
      clearInterval(workTimer.current);
      workTimer.current = null;
    }
  }, []);

  const animateLogsContainer = useCallback(
    (show) => {
      Animated.timing(logsContainerHeight, {
        toValue: show ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start();
    },
    [logsContainerHeight]
  );

  const animateStatusChange = useCallback((newStatus) => {
    // Animation logic for status change
    setCurrentStatus(newStatus);
  }, []);

  // Handlers
  const handleGoWork = useCallback(() => {
    triggerHapticFeedback();
    startWorkDurationTimer();
    animateStatusChange("going_to_work");
    startPulseAnimation();
    if (onGoWork) onGoWork();
  }, [
    triggerHapticFeedback,
    startWorkDurationTimer,
    animateStatusChange,
    startPulseAnimation,
    onGoWork,
  ]);

  const handleCheckIn = useCallback(() => {
    triggerHapticFeedback();
    animateStatusChange("checked_in");
    stopPulseAnimation();
    if (onCheckIn) onCheckIn();
  }, [
    triggerHapticFeedback,
    animateStatusChange,
    stopPulseAnimation,
    onCheckIn,
  ]);

  const handlePunch = useCallback(() => {
    triggerHapticFeedback();
    if (onPunch) onPunch();
  }, [triggerHapticFeedback, onPunch]);

  const handleCheckOut = useCallback(() => {
    triggerHapticFeedback();
    animateStatusChange("checked_out");
    if (onCheckOut) onCheckOut();
  }, [triggerHapticFeedback, animateStatusChange, onCheckOut]);

  const handleComplete = useCallback(() => {
    triggerHapticFeedback();
    animateStatusChange("completed");
    stopWorkDurationTimer();
    if (onComplete) onComplete();
  }, [
    triggerHapticFeedback,
    animateStatusChange,
    stopWorkDurationTimer,
    onComplete,
  ]);

  const toggleLogs = useCallback(() => {
    setIsLogsVisible((prev) => !prev);
  }, []);

  // Effects
  useEffect(() => {
    setCurrentStatus(status);

    if (status === "going_to_work") {
      startWorkDurationTimer();
      startPulseAnimation();
    } else if (status === "not_started") {
      stopWorkDurationTimer();
      stopPulseAnimation();
    }

    return () => {
      stopWorkDurationTimer();
    };
  }, [
    status,
    startWorkDurationTimer,
    stopWorkDurationTimer,
    startPulseAnimation,
    stopPulseAnimation,
  ]);

  useEffect(() => {
    animateLogsContainer(isLogsVisible);
  }, [isLogsVisible, animateLogsContainer]);

  useEffect(() => {
    setIsLogsVisible(showLogs);
  }, [showLogs]);

  // Render helpers
  const renderButton = useCallback(() => {
    const buttonConfig = {
      not_started: {
        text: t("home.goToWork"),
        icon: "directions-walk",
        color: COLORS.primary,
        onPress: handleGoWork,
      },
      going_to_work: {
        text: t("home.logCheckIn"),
        icon: "login",
        color: COLORS.success,
        onPress: handleCheckIn,
      },
      checked_in: {
        text:
          currentStatus === "checked_in"
            ? t("home.logCheckOut")
            : t("home.logPunch"),
        icon: currentStatus === "checked_in" ? "logout" : "touch-app",
        color: currentStatus === "checked_in" ? COLORS.warning : COLORS.info,
        onPress: currentStatus === "checked_in" ? handleCheckOut : handlePunch,
      },
      checked_out: {
        text: t("home.logComplete"),
        icon: "done-all",
        color: COLORS.success,
        onPress: handleComplete,
      },
      completed: {
        text: t("home.goToWork"),
        icon: "directions-walk",
        color: COLORS.primary,
        onPress: handleGoWork,
      },
    };

    const config = buttonConfig[currentStatus] || buttonConfig["not_started"];

    return (
      <Animated.View
        style={{
          transform: [
            { scale: currentStatus === "going_to_work" ? pulseAnim : 1 },
          ],
        }}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: config.color }]}
          onPress={config.onPress}
        >
          <MaterialIcons name={config.icon} size={24} color="white" />
          <Text style={styles.buttonText}>{config.text}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }, [
    currentStatus,
    t,
    pulseAnim,
    handleGoWork,
    handleCheckIn,
    handleCheckOut,
    handlePunch,
    handleComplete,
  ]);

  const renderLogs = useMemo(() => {
    const maxHeight = logsContainerHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, Math.min(logs.length * 40, 200)],
    });

    return (
      <Animated.View style={[styles.logsContainer, { maxHeight }]}>
        {logs.map((log, index) => (
          <LogItem
            key={log.id || index}
            icon={log.icon || "event-note"}
            text={log.text}
            time={log.time}
            isActive={log.isActive}
          />
        ))}
      </Animated.View>
    );
  }, [logs, logsContainerHeight]);

  const renderWorkDuration = useMemo(() => {
    if (currentStatus === "not_started" || currentStatus === "completed")
      return null;

    const hours = Math.floor(workDuration / 60);
    const minutes = workDuration % 60;
    const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return (
      <Text style={styles.durationText}>
        {t("home.workingFor", { duration: durationText })}
      </Text>
    );
  }, [currentStatus, workDuration, t]);

  return (
    <View style={styles.container}>
      {renderWorkDuration}

      {renderButton()}

      {logs.length > 0 && (
        <TouchableOpacity style={styles.logsToggle} onPress={toggleLogs}>
          <MaterialIcons
            name={isLogsVisible ? "expand-less" : "expand-more"}
            size={24}
            color={COLORS.darkGray}
          />
          <Text style={styles.logsToggleText}>
            {isLogsVisible ? t("common.hideLogs") : t("common.showLogs")}
          </Text>
        </TouchableOpacity>
      )}

      {renderLogs}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  durationText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  logsToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 4,
  },
  logsToggleText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 4,
  },
  logsContainer: {
    width: "100%",
    overflow: "hidden",
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  activeLogItem: {
    backgroundColor: COLORS.accent + "20",
  },
  logText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  logTime: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
});

export default React.memo(MultiButton);
