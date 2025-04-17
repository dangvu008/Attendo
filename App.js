"use client";

import React from "react";
import { LocalizationProvider } from "./localization";
import TranslationExample from "./components/TranslationExample-localized";

export default function App() {
  return (
    <LocalizationProvider>
      <TranslationExample />
    </LocalizationProvider>
  );
}
