// This file contains global type declarations for modules without TypeScript definitions

// Declare modules for image imports
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// Declare modules for audio imports
declare module '*.mp3';
declare module '*.wav';

// Add any other module declarations as needed
