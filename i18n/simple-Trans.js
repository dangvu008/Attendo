import React from "react";
import { Text } from "react-native";
import { Trans as ReactI18nextTrans } from "react-i18next";

// Component đơn giản hóa cho Snack.expo.dev
const Trans = (props) => {
  // Fallback đơn giản nếu có lỗi
  try {
    return <ReactI18nextTrans {...props} />;
  } catch (error) {
    console.error("Error rendering Trans component:", error);
    // Fallback: hiển thị children hoặc i18nKey
    return <Text>{props.children || props.i18nKey || "Translation error"}</Text>;
  }
};

export default Trans;
