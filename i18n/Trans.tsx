// Direct re-export of the Trans component from react-i18next
// This avoids any circular dependencies or initialization issues
import React from 'react';
import { Trans as ReactI18nextTrans, TransProps } from 'react-i18next';

// Create a type-safe wrapper for the Trans component
const Trans: React.FC<TransProps<any>> = (props) => {
  return <ReactI18nextTrans {...props} />;
};

export default Trans;
