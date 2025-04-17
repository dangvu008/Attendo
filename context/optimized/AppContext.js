import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from "react";
import { saveData, loadData } from "../../utils/optimized/storageUtils";
import { STORAGE_KEYS } from "../../constants/storage";
import i18next from "i18next";
import { getDayOfWeek } from "../../utils/dateUtils";

const AppContext = createContext();

// Tách các giá trị mặc định ra ngoài component để tránh tạo lại mỗi lần render
const defaultUserSettings = {
  multiButtonMode: "full",
  firstDayOfWeek: "Mon",
  timeFormat: "24h",
  theme: "light",
  alarmSoundEnabled: true,
  alarmVibrationEnabled: true,
  hapticFeedbackEnabled: true,
  changeShiftReminderMode: "ask_weekly",
  weatherWarningEnabled: true,
  language: "vi",
  weatherLocation: null,
};

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [shifts, setShifts] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [notes, setNotes] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [userSettings, setUserSettings] = useState(defaultUserSettings);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [dailyWorkStatus, setDailyWorkStatus] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Tối ưu hóa các hàm với useCallback
  const updateSettings = useCallback((newSettings) => {
    setUserSettings((prevSettings) => {
      const updatedSettings = { ...prevSettings, ...newSettings };

      // Nếu ngôn ngữ thay đổi, cập nhật i18next
      if (newSettings.language && newSettings.language !== prevSettings.language) {
        try {
          i18next.changeLanguage(newSettings.language);
        } catch (error) {
          console.error("Error changing language:", error);
        }
      }

      return updatedSettings;
    });
  }, []);

  const addShift = useCallback((shift) => {
    setShifts((prevShifts) => [...prevShifts, { ...shift, id: Date.now().toString() }]);
  }, []);

  const updateShift = useCallback((updatedShift) => {
    setShifts((prevShifts) =>
      prevShifts.map((shift) => (shift.id === updatedShift.id ? updatedShift : shift))
    );
  }, []);

  const deleteShift = useCallback((shiftId) => {
    setShifts((prevShifts) => prevShifts.filter((shift) => shift.id !== shiftId));
  }, []);

  const addAttendanceRecord = useCallback((record) => {
    setAttendanceRecords((prevRecords) => [...prevRecords, { ...record, id: Date.now().toString() }]);
  }, []);

  const updateWeatherData = useCallback((data) => {
    setWeatherData(data);
  }, []);

  const addNote = useCallback((note) => {
    setNotes((prevNotes) => [...prevNotes, { ...note, id: Date.now().toString() }]);
  }, []);

  const updateNote = useCallback((updatedNote) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  }, []);

  const deleteNote = useCallback((noteId) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  }, []);

  const resetDailyWorkStatus = useCallback(() => {
    setDailyWorkStatus({});
  }, []);

  const addAttendanceLog = useCallback((log) => {
    setAttendanceLogs((prevLogs) => [...prevLogs, { ...log, id: Date.now().toString() }]);
  }, []);

  // Tối ưu hóa các hàm tính toán với useMemo
  const getNotesForToday = useMemo(() => {
    const today = new Date();
    const dayOfWeek = getDayOfWeek(today).toLowerCase();
    
    return notes.filter((note) => {
      // Kiểm tra nếu ghi chú có ngày nhắc nhở là hôm nay
      if (note.reminderDays && note.reminderDays.includes(dayOfWeek)) {
        return true;
      }
      
      // Kiểm tra nếu ghi chú liên kết với ca làm việc hôm nay
      if (note.associatedShifts && note.associatedShifts.length > 0) {
        const todayShifts = shifts.filter((shift) => {
          return shift.daysApplied && shift.daysApplied.includes(dayOfWeek);
        });
        
        return todayShifts.some((shift) => note.associatedShifts.includes(shift.id));
      }
      
      return false;
    });
  }, [notes, shifts]);

  const getNextReminderDate = useCallback((note) => {
    if (!note.reminderDays || note.reminderDays.length === 0) {
      return null;
    }

    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
    
    // Chuyển đổi reminderDays thành các số ngày trong tuần
    const reminderDayIndices = note.reminderDays.map((day) => dayMap[day.toLowerCase()]);
    
    // Tìm ngày nhắc nhở tiếp theo
    let nextDayIndex = reminderDayIndices.find((day) => day > currentDayIndex);
    
    // Nếu không có ngày nào lớn hơn ngày hiện tại, lấy ngày đầu tiên của tuần sau
    if (nextDayIndex === undefined) {
      nextDayIndex = reminderDayIndices[0];
      // Thêm 7 ngày để chuyển sang tuần sau
      const daysToAdd = 7 - currentDayIndex + nextDayIndex;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysToAdd);
      return nextDate;
    } else {
      // Tính số ngày cần thêm
      const daysToAdd = nextDayIndex - currentDayIndex;
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + daysToAdd);
      return nextDate;
    }
  }, []);

  const isNoteDuplicate = useCallback((title, content, excludeNoteId = null) => {
    const normalizedTitle = title.trim().toLowerCase();
    const normalizedContent = content.trim().toLowerCase();

    return notes.some(
      (note) =>
        note.id !== excludeNoteId &&
        note.title.trim().toLowerCase() === normalizedTitle &&
        note.content.trim().toLowerCase() === normalizedContent,
    );
  }, [notes]);

  const exportData = useCallback(async () => {
    const data = {
      userSettings,
      shifts,
      attendanceRecords,
      notes,
      weatherData,
      attendanceLogs,
      dailyWorkStatus,
    };

    return JSON.stringify(data);
  }, [userSettings, shifts, attendanceRecords, notes, weatherData, attendanceLogs, dailyWorkStatus]);

  const importData = useCallback(async (data) => {
    try {
      const parsedData = JSON.parse(data);

      setUserSettings(parsedData.userSettings || defaultUserSettings);
      setShifts(parsedData.shifts || []);
      setAttendanceRecords(parsedData.attendanceRecords || []);
      setNotes(parsedData.notes || []);
      setWeatherData(parsedData.weatherData || null);
      setAttendanceLogs(parsedData.attendanceLogs || []);
      setDailyWorkStatus(parsedData.dailyWorkStatus || {});
      
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }, []);

  const getLogsForDate = useCallback((date = new Date()) => {
    const dateStr = date.toISOString().split("T")[0];
    return attendanceLogs.filter(log => log.date && log.date.startsWith(dateStr));
  }, [attendanceLogs]);

  const getDailyStatusForDate = useCallback((date = new Date()) => {
    const dateStr = date.toISOString().split("T")[0];
    return (
      dailyWorkStatus[dateStr] || {
        shiftId: null,
        status: "not_started",
        goWorkTime: null,
        checkInTime: null,
        punchTime: null,
        checkOutTime: null,
        completeTime: null,
      }
    );
  }, [dailyWorkStatus]);

  // Tối ưu hóa việc lưu dữ liệu với useEffect
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await loadData(STORAGE_KEYS.USER_SETTINGS);
        if (storedSettings) {
          setUserSettings(storedSettings);
        } else {
          // Save default settings if none exist
          await saveData(STORAGE_KEYS.USER_SETTINGS, defaultUserSettings);
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };

    loadSettings();
  }, []);

  // Sử dụng một useEffect duy nhất để load tất cả dữ liệu
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // Load shifts
        const storedShifts = await loadData(STORAGE_KEYS.SHIFT_LIST, []);
        setShifts(storedShifts);
        
        // Load attendance records
        const storedRecords = await loadData(STORAGE_KEYS.ATTENDANCE_RECORDS, []);
        setAttendanceRecords(storedRecords);
        
        // Load notes
        const storedNotes = await loadData(STORAGE_KEYS.NOTES, []);
        setNotes(storedNotes);
        
        // Load weather data
        const storedWeatherData = await loadData(STORAGE_KEYS.WEATHER_DATA, null);
        setWeatherData(storedWeatherData);
        
        // Load attendance logs
        const storedLogs = await loadData(STORAGE_KEYS.ATTENDANCE_LOGS, []);
        setAttendanceLogs(storedLogs);
        
        // Load daily work status
        const storedDailyStatus = await loadData(STORAGE_KEYS.DAILY_WORK_STATUS, {});
        setDailyWorkStatus(storedDailyStatus);
      } catch (error) {
        console.error("Error loading data from AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Sử dụng một useEffect duy nhất để lưu tất cả dữ liệu
  useEffect(() => {
    const saveAllData = async () => {
      if (isLoading) return;
      
      try {
        await Promise.all([
          saveData(STORAGE_KEYS.USER_SETTINGS, userSettings),
          saveData(STORAGE_KEYS.SHIFT_LIST, shifts),
          saveData(STORAGE_KEYS.ATTENDANCE_RECORDS, attendanceRecords),
          saveData(STORAGE_KEYS.NOTES, notes),
          saveData(STORAGE_KEYS.WEATHER_DATA, weatherData),
          saveData(STORAGE_KEYS.ATTENDANCE_LOGS, attendanceLogs),
          saveData(STORAGE_KEYS.DAILY_WORK_STATUS, dailyWorkStatus),
        ]);
      } catch (error) {
        console.error("Error saving data to AsyncStorage:", error);
      }
    };
    
    // Sử dụng debounce để tránh lưu quá nhiều lần
    const timeoutId = setTimeout(saveAllData, 500);
    return () => clearTimeout(timeoutId);
  }, [
    isLoading,
    userSettings,
    shifts,
    attendanceRecords,
    notes,
    weatherData,
    attendanceLogs,
    dailyWorkStatus,
  ]);

  // Sử dụng useMemo để tránh tạo lại object value mỗi lần render
  const contextValue = useMemo(() => ({
    isLoading,
    isLoggedIn,
    userInfo,
    shifts,
    attendanceRecords,
    notes,
    weatherData,
    userSettings,
    attendanceLogs,
    dailyWorkStatus,
    updateSettings,
    addShift,
    updateShift,
    deleteShift,
    addAttendanceRecord,
    updateWeatherData,
    addNote,
    updateNote,
    deleteNote,
    getNotesForToday,
    getNextReminderDate,
    isNoteDuplicate,
    exportData,
    importData,
    resetDailyWorkStatus,
    getLogsForDate,
    getDailyStatusForDate,
    addAttendanceLog,
  }), [
    isLoading,
    isLoggedIn,
    userInfo,
    shifts,
    attendanceRecords,
    notes,
    weatherData,
    userSettings,
    attendanceLogs,
    dailyWorkStatus,
    updateSettings,
    addShift,
    updateShift,
    deleteShift,
    addAttendanceRecord,
    updateWeatherData,
    addNote,
    updateNote,
    deleteNote,
    getNotesForToday,
    getNextReminderDate,
    isNoteDuplicate,
    exportData,
    importData,
    resetDailyWorkStatus,
    getLogsForDate,
    getDailyStatusForDate,
    addAttendanceLog,
  ]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Tối ưu hóa hook useAppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
