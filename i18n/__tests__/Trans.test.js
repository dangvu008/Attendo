import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Trans from '../Trans';

// Initialize i18next for testing
i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        welcome: 'Welcome to <1>Workly</1>, your personal shift management app!',
        weather: 'Current weather: <1>{{temperature}}°C</1> - <3>{{condition}}</3>',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

describe('Trans component', () => {
  it('renders correctly with simple text', () => {
    const { getByText } = render(
      <I18nextProvider i18n={i18next}>
        <Trans i18nKey="welcome">
          Welcome to <Text>Workly</Text>, your personal shift management app!
        </Trans>
      </I18nextProvider>
    );
    
    expect(getByText('Workly')).toBeTruthy();
  });
  
  it('renders correctly with interpolation', () => {
    const { getByText } = render(
      <I18nextProvider i18n={i18next}>
        <Trans 
          i18nKey="weather"
          values={{ temperature: 28, condition: 'Sunny' }}
        >
          Current weather: <Text>{{temperature}}°C</Text> - <Text>{{condition}}</Text>
        </Trans>
      </I18nextProvider>
    );
    
    expect(getByText('28°C')).toBeTruthy();
    expect(getByText('Sunny')).toBeTruthy();
  });
});
