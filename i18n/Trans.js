// Đơn giản hóa hoàn toàn - import trực tiếp từ react-i18next
import React from "react";
import { Trans as ReactI18nextTrans } from "react-i18next";

// Tạo một component wrapper đơn giản
function Trans(props) {
  return <ReactI18nextTrans {...props} />;
}

export default Trans;
