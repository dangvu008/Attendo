"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  Animated,
  ActivityIndicator,
  Dimensions,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native"
import { useAppContext } from "../context/AppContext"
import { MaterialIcons } from "@expo/vector-icons"
import { formatDate, timeToMinutes, formatDuration } from "../utils/dateUtils"
import { useTranslation } from "../i18n/useTranslation"
import { multiButtonStyles } from "../styles/components/multiButton"
import { useTheme } from "../context/ThemeContext"
// Import Haptics module from Expo
import * as Haptics from "expo-haptics"

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const { width } = Dimensions.get("window")
const isSmallScreen = width < 375

const MultiButton = () => {
  const { userSettings, shifts, addAttendanceLog, resetDailyWorkStatus, getLogsForDate, getDailyStatusForDate } =
    useAppContext()
  const { t } = useTranslation()
  const { colors, isDarkMode } = useTheme()

  const [activeShift, setActiveShift] = useState(null)
  const [currentStatus, setCurrentStatus] = useState("not_started")
  const [todayLogs, setTodayLogs] = useState([])
  const [buttonEnabled, setButtonEnabled] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [workDuration, setWorkDuration] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const [showLogs, setShowLogs] = useState(false)

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current
  const opacityAnim = useRef(new Animated.Value(1)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const progressAnim = useRef(new Animated.Value(0)).current
  const logsHeightAnim = useRef(new Animated.Value(0)).current
  const buttonColorAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const slideAnim = useRef(new Animated.Value(-50)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Timer for work duration
  const timerRef = useRef(null)
  const pulseTimerRef = useRef(null)

  // Previous status for transition animations
  const prevStatusRef = useRef(currentStatus)

  // Tìm ca làm việc cho ngày hôm nay
  useEffect(() => {
    const today = new Date()
    const dayOfWeek = today.toLocaleString("en-US", { weekday: "short" }).substring(0, 3)

    // Lấy trạng thái hiện tại
    const dailyStatus = getDailyStatusForDate(today)

    // Animate status change if status is different
    if (dailyStatus.status !== currentStatus) {
      animateStatusChange(dailyStatus.status)
    }

    setCurrentStatus(dailyStatus.status)
    prevStatusRef.current = dailyStatus.status

    // Nếu đã có shiftId trong trạng thái, sử dụng nó
    if (dailyStatus.shiftId) {
      const shift = shifts.find((s) => s.id === dailyStatus.shiftId)
      if (shift) {
        setActiveShift(shift)

        // Start timer if currently working
        if (dailyStatus.status === "working" && dailyStatus.checkInTime) {
          startWorkDurationTimer(new Date(dailyStatus.checkInTime))
        }

        return
      }
    }

    // Nếu chưa có, tìm ca làm việc phù hợp cho ngày hôm nay
    const todayShifts = shifts.filter((shift) => shift.daysApplied.includes(dayOfWeek))

    if (todayShifts.length === 1) {
      setActiveShift(todayShifts[0])
    } else if (todayShifts.length > 1) {
      // Nếu có nhiều ca, chọn ca gần nhất với thời gian hiện tại
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      todayShifts.sort((a, b) => {
        const startA = timeToMinutes(a.startTime)
        const startB = timeToMinutes(b.startTime)

        // Tính khoảng cách đến thời gian hiện tại
        const distanceA = Math.abs(startA - currentMinutes)
        const distanceB = Math.abs(startB - currentMinutes)

        return distanceA - distanceB
      })

      setActiveShift(todayShifts[0])
    }
  }, [shifts, getDailyStatusForDate])

  // Lấy logs cho ngày hôm nay
  useEffect(() => {
    const logs = getLogsForDate(new Date())

    // Use LayoutAnimation for smooth transition when logs change
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    setTodayLogs(logs)

    // If we have logs, animate the logs container
    if (logs.length > 0 && !showLogs) {
      setTimeout(() => {
        setShowLogs(true)
        animateLogsContainer(true)
      }, 500)
    }
  }, [getLogsForDate])

  // Kiểm tra xem nút có nên được enabled hay không
  useEffect(() => {
    if (!activeShift) {
      setButtonEnabled(false)
      return
    }

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    switch (currentStatus) {
      case "not_started":
        // Luôn cho phép bấm "Đi làm"
        setButtonEnabled(true)
        break
      case "waiting_check_in": {
        // Cho phép check-in khi gần đến giờ bắt đầu (trong vòng 30 phút)
        const startMinutes = timeToMinutes(activeShift.startTime)
        setButtonEnabled(Math.abs(currentMinutes - startMinutes) <= 30)
        break
      }
      case "working": {
        // Cho phép check-out khi đã làm việc đủ thời gian tối thiểu hoặc gần đến giờ kết thúc
        const dailyStatus = getDailyStatusForDate(now)
        if (dailyStatus.checkInTime) {
          const checkInTime = new Date(dailyStatus.checkInTime)
          const workingMinutes = Math.floor((now - checkInTime) / 60000)

          // Tối thiểu 30 phút làm việc hoặc gần đến giờ kết thúc
          const officeEndMinutes = timeToMinutes(activeShift.officeEndTime)
          setButtonEnabled(workingMinutes >= 30 || Math.abs(currentMinutes - officeEndMinutes) <= 30)

          // Start pulsing animation when close to end time
          if (Math.abs(currentMinutes - officeEndMinutes) <= 15) {
            startPulseAnimation()
          } else {
            stopPulseAnimation()
          }
        } else {
          setButtonEnabled(false)
        }
        break
      }
      case "ready_to_complete":
        // Luôn cho phép hoàn tất
        setButtonEnabled(true)
        break
      case "completed":
        // Đã hoàn tất, không cho phép bấm nút chính
        setButtonEnabled(false)
        break
      default:
        setButtonEnabled(true)
    }
  }, [currentStatus, activeShift, getDailyStatusForDate])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (pulseTimerRef.current) {
        clearInterval(pulseTimerRef.current)
      }
    }
  }, [])

  // Function to trigger haptic feedback based on intensity
  const triggerHapticFeedback = (intensity = "medium") => {
    // Only trigger haptic feedback if it's enabled in user settings
    if (userSettings.hapticFeedbackEnabled !== false) {
      try {
        switch (intensity) {
          case "light":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            break
          case "medium":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
            break
          case "heavy":
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
            break
          case "success":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
            break
          case "warning":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
            break
          case "error":
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
            break
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        }
      } catch (error) {
        console.log("Haptic feedback error:", error)
        // Silently fail if haptics aren't available
      }
    }
  }

  // Animate status change
  const animateStatusChange = (newStatus) => {
    // Trigger appropriate haptic feedback based on the new status
    switch (newStatus) {
      case "waiting_check_in":
        triggerHapticFeedback("light")
        break
      case "working":
        triggerHapticFeedback("success")
        break
      case "ready_to_complete":
        triggerHapticFeedback("medium")
        break
      case "completed":
        triggerHapticFeedback("success")
        break
      default:
        triggerHapticFeedback("light")
    }

    // Animate button color change
    Animated.timing(buttonColorAnim, {
      toValue: getButtonColorValue(newStatus),
      duration: 500,
      useNativeDriver: false,
    }).start()

    // Slide in the status text
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()

    // Use LayoutAnimation for smooth transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
  }

  // Get button color value for animation
  const getButtonColorValue = (status) => {
    switch (status) {
      case "not_started":
        return 0
      case "waiting_check_in":
        return 1
      case "working":
        return 2
      case "ready_to_complete":
        return 3
      case "completed":
        return 4
      default:
        return 0
    }
  }

  // Interpolate button color
  const buttonColor = buttonColorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4],
    outputRange: [colors.primary, colors.info, colors.error, colors.success, colors.gray],
  })

  // Start timer to track work duration
  const startWorkDurationTimer = (checkInTime) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    const updateDuration = () => {
      const now = new Date()
      const durationMinutes = Math.floor((now - checkInTime) / 60000)
      setWorkDuration(durationMinutes)

      // Animate progress based on expected work duration (8 hours by default)
      const expectedDuration = 8 * 60 // 8 hours in minutes
      const progress = Math.min(durationMinutes / expectedDuration, 1)

      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start()
    }

    updateDuration() // Initial update
    timerRef.current = setInterval(updateDuration, 60000) // Update every minute
  }

  // Start pulse animation
  const startPulseAnimation = () => {
    if (pulseTimerRef.current) return

    const pulse = () => {
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
      ]).start()
    }

    pulse()
    pulseTimerRef.current = setInterval(pulse, 1600)
  }

  // Stop pulse animation
  const stopPulseAnimation = () => {
    if (pulseTimerRef.current) {
      clearInterval(pulseTimerRef.current)
      pulseTimerRef.current = null

      // Reset to normal size
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }

  // Animate logs container
  const animateLogsContainer = (show) => {
    // Trigger light haptic feedback when toggling logs
    triggerHapticFeedback("light")

    const targetHeight = show ? 1 : 0

    Animated.timing(logsHeightAnim, {
      toValue: targetHeight,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  // Toggle logs visibility
  const toggleLogs = () => {
    // Trigger haptic feedback when toggling logs
    triggerHapticFeedback("light")

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setShowLogs(!showLogs)
    animateLogsContainer(!showLogs)
  }

  // Animate button press
  const animateButtonPress = () => {
    // Trigger medium haptic feedback for main button press
    triggerHapticFeedback("medium")

    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start()
  }

  // Animate reset button
  const animateResetButton = () => {
    // Trigger warning haptic feedback for reset button
    triggerHapticFeedback("warning")

    Animated.timing(rotateAnim, {
      toValue: rotateAnim._value + 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  // Xử lý khi bấm nút
  const handleButtonPress = () => {
    if (!activeShift) {
      // Trigger error haptic feedback when there's no active shift
      triggerHapticFeedback("error")
      Alert.alert(t("common.error"), t("home.noActiveShift"))
      return
    }

    animateButtonPress()

    switch (currentStatus) {
      case "not_started":
        executeAction("go_work")
        break
      case "waiting_check_in":
        executeAction("check_in")
        break
      case "working":
        // Show confirmation for check-out
        setPendingAction("check_out")
        setShowConfirmation(true)
        // Trigger warning haptic feedback for confirmation dialog
        triggerHapticFeedback("warning")
        break
      case "ready_to_complete":
        executeAction("complete")
        break
      default:
        break
    }
  }

  // Execute the action after confirmation if needed
  const executeAction = useCallback(
    (action) => {
      if (!activeShift) return

      setIsProcessing(true)

      // Simulate a short delay for better UX
      setTimeout(() => {
        switch (action) {
          case "go_work":
            handleGoWork()
            break
          case "check_in":
            handleCheckIn()
            break
          case "check_out":
            handleCheckOut()
            break
          case "complete":
            handleComplete()
            break
          case "punch":
            handlePunch()
            break
        }

        setIsProcessing(false)
        setShowConfirmation(false)
        setPendingAction(null)
      }, 500)
    },
    [activeShift],
  )

  // Handle confirmation dialog
  const handleConfirmation = (confirmed) => {
    if (confirmed && pendingAction) {
      // Trigger success haptic feedback when confirming
      triggerHapticFeedback("success")
      executeAction(pendingAction)
    } else {
      // Trigger light haptic feedback when canceling
      triggerHapticFeedback("light")
      setShowConfirmation(false)
      setPendingAction(null)
    }
  }

  // Xử lý "Đi làm"
  const handleGoWork = useCallback(() => {
    if (!activeShift) return

    // Trigger success haptic feedback when going to work
    triggerHapticFeedback("success")
    addAttendanceLog("go_work", activeShift.id)
    setCurrentStatus("waiting_check_in")
  }, [activeShift, addAttendanceLog, triggerHapticFeedback])

  // Xử lý "Chấm công vào"
  const handleCheckIn = useCallback(() => {
    if (!activeShift) return

    // Trigger success haptic feedback when checking in
    triggerHapticFeedback("success")
    const now = new Date()
    addAttendanceLog("check_in", activeShift.id)
    setCurrentStatus("working")
    startWorkDurationTimer(now)
  }, [activeShift, addAttendanceLog])

  // Xử lý "Ký công"
  const handlePunch = useCallback(() => {
    if (!activeShift) return

    // Trigger medium haptic feedback when punching
    triggerHapticFeedback("medium")
    animateButtonPress()
    addAttendanceLog("punch", activeShift.id)
  }, [activeShift, animateButtonPress, addAttendanceLog, triggerHapticFeedback])

  // Xử lý "Chấm công ra"
  const handleCheckOut = useCallback(() => {
    if (!activeShift) return

    // Trigger success haptic feedback when checking out
    triggerHapticFeedback("success")

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (pulseTimerRef.current) {
      clearInterval(pulseTimerRef.current)
      pulseTimerRef.current = null
    }

    addAttendanceLog("check_out", activeShift.id)
    setCurrentStatus("ready_to_complete")
    setWorkDuration(null)
  }, [activeShift, addAttendanceLog, triggerHapticFeedback])

  // Xử lý "Hoàn tất"
  const handleComplete = useCallback(() => {
    if (!activeShift) return

    // Trigger success haptic feedback when completing
    triggerHapticFeedback("success")
    addAttendanceLog("complete", activeShift.id)
    setCurrentStatus("completed")
  }, [activeShift, addAttendanceLog, triggerHapticFeedback])

  // Xử lý reset
  const handleReset = () => {
    animateResetButton()

    Alert.alert(t("common.confirm"), t("home.resetConfirmation"), [
      { text: t("common.cancel"), style: "cancel", onPress: () => triggerHapticFeedback("light") },
      {
        text: t("common.confirm"),
        onPress: () => {
          // Trigger error haptic feedback when resetting
          triggerHapticFeedback("error")

          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }

          if (pulseTimerRef.current) {
            clearInterval(pulseTimerRef.current)
            pulseTimerRef.current = null
          }

          resetDailyWorkStatus()
          setCurrentStatus("not_started")
          setTodayLogs([])
          setWorkDuration(null)

          // Animate logs container closing
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
          setShowLogs(false)
          animateLogsContainer(false)
        },
        style: "destructive",
      },
    ])
  }

  // Lấy thông tin hiển thị cho nút dựa trên trạng thái
  const getButtonInfo = () => {
    switch (currentStatus) {
      case "not_started":
        return {
          text: t("home.goWork"),
          icon: "directions-walk",
          color: colors.primary,
          description: t("home.goWorkDescription") || "Start your workday",
        }
      case "waiting_check_in":
        return {
          text: t("home.waitingCheckIn"),
          icon: "schedule",
          color: colors.info,
          description: t("home.waitingCheckInDescription") || "Ready to check in",
        }
      case "working":
        return {
          text: t("home.checkOut"),
          icon: "logout",
          color: colors.error,
          description: workDuration
            ? t("home.workingFor", { duration: formatDuration(workDuration) }) ||
              `Working for ${formatDuration(workDuration)}`
            : "",
        }
      case "ready_to_complete":
        return {
          text: t("home.complete"),
          icon: "check-circle",
          color: colors.success,
          description: t("home.completeDescription") || "Finish your workday",
        }
      case "completed":
        return {
          text: t("home.completed"),
          icon: "done-all",
          color: colors.gray,
          description: t("home.completedDescription") || "Workday completed",
        }
      default:
        return {
          text: t("home.goWork"),
          icon: "directions-walk",
          color: colors.primary,
          description: "",
        }
    }
  }

  // Render log item
  const renderLogItem = ({ item, index }) => {
    let logTypeText = ""
    let logIcon = ""

    switch (item.type) {
      case "go_work":
        logTypeText = t("home.logGoWork")
        logIcon = "directions-walk"
        break
      case "check_in":
        logTypeText = t("home.logCheckIn")
        logIcon = "login"
        break
      case "punch":
        logTypeText = t("home.logPunch")
        logIcon = "touch-app"
        break
      case "check_out":
        logTypeText = t("home.logCheckOut")
        logIcon = "logout"
        break
      case "complete":
        logTypeText = t("home.logComplete")
        logIcon = "check-circle"
        break
      default:
        logTypeText = item.type
        logIcon = "info"
    }

    // Create staggered animation for log items
    // const itemFadeAnim = useRef(new Animated.Value(0)).current
    // const itemSlideAnim = useRef(new Animated.Value(50)).current

    // useEffect(() => {
    //   Animated.sequence([
    //     Animated.delay(index * 100), // Stagger based on index
    //     Animated.parallel([
    //       Animated.timing(itemFadeAnim, {
    //         toValue: 1,
    //         duration: 300,
    //         useNativeDriver: true,
    //       }),
    //       Animated.timing(itemSlideAnim, {
    //         toValue: 0,
    //         duration: 300,
    //         easing: Easing.out(Easing.back(1.5)),
    //         useNativeDriver: true,
    //       }),
    //     ]),
    //   ]).start()
    // }, [])

    const itemFadeAnim = useRef(new Animated.Value(0)).current
    const itemSlideAnim = useRef(new Animated.Value(50)).current

    useEffect(() => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.timing(itemFadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(itemSlideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
        ]),
      ]).start()
    }, [index, itemFadeAnim, itemSlideAnim])

    return (
      <Animated.View
        style={[
          multiButtonStyles.logItem,
          {
            borderBottomColor: colors.border,
            opacity: itemFadeAnim,
            transform: [{ translateX: itemSlideAnim }],
          },
        ]}
      >
        <View style={[multiButtonStyles.logIconContainer, { backgroundColor: colors.primary }]}>
          <MaterialIcons name={logIcon} size={16} color={colors.white} />
        </View>
        <View style={multiButtonStyles.logContent}>
          <Text style={[multiButtonStyles.logType, { color: colors.text }]}>{logTypeText}</Text>
          <Text style={[multiButtonStyles.logTime, { color: colors.gray }]}>
            {formatDate(new Date(item.date), "time")}
          </Text>
        </View>
      </Animated.View>
    )
  }

  // Lấy thông tin nút
  const buttonInfo = getButtonInfo()

  // Kiểm tra xem có hiển thị nút Ký công không
  const showPunchButton = currentStatus === "working" && activeShift && activeShift.showPunch

  // Kiểm tra xem có hiển thị nút Reset không
  const showResetButton = todayLogs.length > 0

  // Rotate interpolation for reset button
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  // Progress bar width interpolation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  })

  // Render confirmation dialog
  const renderConfirmationDialog = () => {
    if (!showConfirmation) return null

    let title = ""
    let message = ""

    switch (pendingAction) {
      case "check_out":
        title = t("home.confirmCheckOut") || "Confirm Check Out"
        message = t("home.confirmCheckOutMessage") || "Are you sure you want to check out now?"
        break
      default:
        return null
    }

    // Animation for dialog appearance
    const dialogScaleAnim = useRef(new Animated.Value(0.8)).current
    const dialogOpacityAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      if (showConfirmation) {
        Animated.parallel([
          Animated.timing(dialogScaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(dialogOpacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start()
      }
    }, [showConfirmation])

    return (
      <Animated.View style={[multiButtonStyles.confirmationOverlay, { opacity: dialogOpacityAnim }]}>
        <Animated.View
          style={[
            multiButtonStyles.confirmationDialog,
            {
              backgroundColor: colors.card,
              transform: [{ scale: dialogScaleAnim }],
            },
          ]}
        >
          <Text style={[multiButtonStyles.confirmationTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[multiButtonStyles.confirmationMessage, { color: colors.darkGray }]}>{message}</Text>

          <View style={multiButtonStyles.confirmationButtons}>
            <TouchableOpacity
              style={[multiButtonStyles.confirmationButton, multiButtonStyles.cancelButton]}
              onPress={() => handleConfirmation(false)}
            >
              <Text style={multiButtonStyles.confirmationButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[multiButtonStyles.confirmationButton, { backgroundColor: colors.primary }]}
              onPress={() => handleConfirmation(true)}
            >
              <Text style={[multiButtonStyles.confirmationButtonText, { color: colors.white }]}>
                {t("common.confirm")}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    )
  }

  return (
    <View style={multiButtonStyles.container}>
      <View style={multiButtonStyles.buttonContainer}>
        {/* Nút chính */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }, ...(currentStatus === "working" ? [{ scale: pulseAnim }] : [])],
            opacity: opacityAnim,
            flex: 1,
          }}
        >
          <TouchableOpacity
            style={[
              multiButtonStyles.mainButton,
              { backgroundColor: buttonColor },
              !buttonEnabled && multiButtonStyles.disabledButton,
            ]}
            onPress={handleButtonPress}
            disabled={!buttonEnabled || isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name={buttonInfo.icon} size={24} color={colors.white} />
                <Text style={[multiButtonStyles.buttonText, { color: colors.white }]}>{buttonInfo.text}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Progress bar for working time */}
          {currentStatus === "working" && workDuration > 0 && (
            <View style={multiButtonStyles.progressBarContainer}>
              <Animated.View
                style={[
                  multiButtonStyles.progressBar,
                  {
                    width: progressWidth,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          )}

          {buttonInfo.description ? (
            <Animated.Text
              style={[
                multiButtonStyles.buttonDescription,
                {
                  color: colors.darkGray,
                  opacity: fadeAnim,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {buttonInfo.description}
            </Animated.Text>
          ) : null}
        </Animated.View>

        {/* Nút Ký công (nếu cần) */}
        {showPunchButton && (
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            }}
          >
            <TouchableOpacity
              style={[multiButtonStyles.punchButton, { backgroundColor: colors.accent }]}
              onPress={handlePunch}
              disabled={isProcessing}
            >
              <MaterialIcons name="touch-app" size={20} color={colors.white} />
              <Text style={[multiButtonStyles.punchButtonText, { color: colors.white }]}>{t("home.punch")}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Nút Reset */}
        {showResetButton && (
          <Animated.View
            style={[
              multiButtonStyles.resetButton,
              {
                backgroundColor: colors.error,
                transform: [{ rotate: spin }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleReset}
              disabled={isProcessing}
              style={multiButtonStyles.resetButtonTouchable}
            >
              <MaterialIcons name="refresh" size={16} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Hiển thị ca làm việc hiện tại */}
      {activeShift && (
        <Animated.View
          style={[
            multiButtonStyles.activeShiftContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={[multiButtonStyles.activeShiftText, { color: colors.darkGray }]}>
            {t("home.activeShift")}: {activeShift.name} ({activeShift.startTime} - {activeShift.endTime})
          </Text>
        </Animated.View>
      )}

      {/* Logs header with toggle button */}
      {todayLogs.length > 0 && (
        <TouchableOpacity style={multiButtonStyles.logsHeader} onPress={toggleLogs}>
          <Text style={[multiButtonStyles.logsTitle, { color: colors.text }]}>
            {t("home.todayLogs")} ({todayLogs.length})
          </Text>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: logsHeightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "180deg"],
                  }),
                },
              ],
            }}
          >
            <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.primary} />
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Lịch sử bấm nút */}
      {todayLogs.length > 0 && (
        <Animated.View
          style={[
            multiButtonStyles.logsContainer,
            {
              backgroundColor: colors.card,
              maxHeight: logsHeightAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 300],
              }),
              opacity: logsHeightAnim,
              overflow: "hidden",
            },
          ]}
        >
          {showLogs && (
            <FlatList
              data={todayLogs}
              renderItem={renderLogItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={true}
              contentContainerStyle={multiButtonStyles.logsList}
            />
          )}
        </Animated.View>
      )}

      {/* Confirmation Dialog */}
      {renderConfirmationDialog()}
    </View>
  )
}

export default MultiButton
