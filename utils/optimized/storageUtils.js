import AsyncStorage from "@react-native-async-storage/async-storage";

// Hàm lưu dữ liệu với xử lý lỗi tốt hơn
export const saveData = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    return false;
  }
};

// Hàm đọc dữ liệu với xử lý lỗi tốt hơn
export const loadData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return defaultValue;
  }
};

// Hàm xóa dữ liệu
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
};

// Hàm lưu nhiều dữ liệu cùng lúc
export const multiSaveData = async (keyValuePairs) => {
  try {
    const pairs = keyValuePairs.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error("Error saving multiple data:", error);
    return false;
  }
};

// Hàm đọc nhiều dữ liệu cùng lúc
export const multiLoadData = async (keys) => {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    return pairs.map(([key, value]) => [key, value ? JSON.parse(value) : null]);
  } catch (error) {
    console.error("Error loading multiple data:", error);
    return keys.map(key => [key, null]);
  }
};

// Hàm lưu dữ liệu với thời gian hết hạn
export const saveDataWithExpiry = async (key, data, expiryInMinutes) => {
  try {
    const item = {
      value: data,
      expiry: Date.now() + expiryInMinutes * 60 * 1000,
    };
    await saveData(key, item);
    return true;
  } catch (error) {
    console.error(`Error saving data with expiry for key ${key}:`, error);
    return false;
  }
};

// Hàm đọc dữ liệu có thời gian hết hạn
export const loadDataWithExpiry = async (key, defaultValue = null) => {
  try {
    const item = await loadData(key);
    
    // Kiểm tra nếu dữ liệu không tồn tại hoặc đã hết hạn
    if (!item || Date.now() > item.expiry) {
      await removeData(key);
      return defaultValue;
    }
    
    return item.value;
  } catch (error) {
    console.error(`Error loading data with expiry for key ${key}:`, error);
    return defaultValue;
  }
};
