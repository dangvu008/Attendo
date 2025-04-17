"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from "react-native"
import { useAppContext } from "../context/AppContext"
import { COLORS } from "../constants/colors"
import { MaterialIcons } from "@expo/vector-icons"
import * as Location from "expo-location"
import WeatherIcon from "../components/WeatherIcon"
import ForecastItem from "../components/ForecastItem"
import { useTranslation } from "../i18n/useTranslation"

const WeatherScreen = () => {
  const { userSettings, weatherData, updateWeatherData, updateSettings } = useAppContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [forecast, setForecast] = useState([])
  const { t } = useTranslation()

  // Use one of the provided API keys
  const OPENWEATHER_API_KEY = "db077a0c565a5ff3e7a3ca8ff9623575"

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get location permission
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        setError(t("weather.locationDenied"))
        setLoading(false)
        return
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      const { latitude, longitude } = location.coords

      // Update location in settings
      updateSettings({
        weatherLocation: { lat: latitude, lon: longitude },
      })

      // Fetch current weather data from OpenWeather API
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}&lang=${userSettings.language}`,
      )

      if (!weatherResponse.ok) {
        throw new Error(`${t("weather.weatherError")} (${weatherResponse.status})`)
      }

      const weatherData = await weatherResponse.json()

      // Fetch forecast data (5 days / 3 hour forecast)
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}&lang=${userSettings.language}`,
      )

      if (!forecastResponse.ok) {
        throw new Error(`${t("weather.forecastError")} (${forecastResponse.status})`)
      }

      const forecastData = await forecastResponse.json()

      // Get location name
      const locationResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${OPENWEATHER_API_KEY}`,
      )

      let locationName = t("weather.currentLocation")

      if (locationResponse.ok) {
        const locationData = await locationResponse.json()
        if (locationData.length > 0) {
          locationName = locationData[0].name
          if (locationData[0].state && locationData[0].state !== locationData[0].name) {
            locationName += `, ${locationData[0].state}`
          }
        }
      }

      // Check for extreme weather conditions
      let warning = null

      if (weatherData.main.temp > 35) {
        warning = t("weather.warnings.highTemp")
      } else if (weatherData.main.temp < 10) {
        warning = t("weather.warnings.lowTemp")
      }

      if (weatherData.weather[0].main === "Thunderstorm") {
        warning = t("weather.warnings.thunderstorm")
      } else if (weatherData.weather[0].main === "Rain" && weatherData.rain && weatherData.rain["1h"] > 10) {
        warning = t("weather.warnings.heavyRain")
      }

      // Update weather data
      const weatherInfo = {
        location: locationName,
        temperature: Math.round(weatherData.main.temp),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: weatherData.wind.speed,
        icon: weatherData.weather[0].icon,
        warning,
        lastUpdated: new Date().toISOString(),
      }

      updateWeatherData(weatherInfo)

      // Process forecast data
      // Group forecast by day and calculate min/max temperatures
      const processedForecast = processForecastData(forecastData.list)
      setForecast(processedForecast)

      // Show success message
      Alert.alert(t("common.success"), t("weather.updatedSuccessfully"), [{ text: t("common.ok") }])
    } catch (err) {
      console.error("Error fetching weather:", err)
      setError(t("weather.weatherError"))
      Alert.alert(t("common.error"), t("weather.weatherError"), [{ text: t("common.ok") }])
    } finally {
      setLoading(false)
    }
  }

  // Process forecast data to group by day
  const processForecastData = (forecastList) => {
    const dailyData = {}

    // Group forecast data by day
    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000)
      const day = date.toISOString().split("T")[0]

      if (!dailyData[day]) {
        dailyData[day] = {
          date: date.toISOString(),
          temps: [],
          icons: [],
          descriptions: [],
        }
      }

      dailyData[day].temps.push(item.main.temp)
      dailyData[day].icons.push(item.weather[0].icon)
      dailyData[day].descriptions.push(item.weather[0].description)
    })

    // Calculate min/max temperatures and get most frequent icon and description
    const processedData = Object.keys(dailyData).map((day) => {
      const dayData = dailyData[day]

      // Get min and max temperatures
      const minTemp = Math.min(...dayData.temps)
      const maxTemp = Math.max(...dayData.temps)

      // Get most frequent icon
      const iconCounts = {}
      dayData.icons.forEach((icon) => {
        iconCounts[icon] = (iconCounts[icon] || 0) + 1
      })
      const icon = Object.keys(iconCounts).reduce((a, b) => (iconCounts[a] > iconCounts[b] ? a : b), dayData.icons[0])

      // Get most frequent description
      const descCounts = {}
      dayData.descriptions.forEach((desc) => {
        descCounts[desc] = (descCounts[desc] || 0) + 1
      })
      const description = Object.keys(descCounts).reduce(
        (a, b) => (descCounts[a] > descCounts[b] ? a : b),
        dayData.descriptions[0],
      )

      return {
        date: dayData.date,
        minTemp,
        maxTemp,
        icon,
        description,
      }
    })

    // Sort by date and limit to 5 days
    return processedData.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5)
  }

  useEffect(() => {
    // Only fetch automatically if we don't have weather data or it's older than 1 hour
    if (!weatherData || !weatherData.lastUpdated || new Date() - new Date(weatherData.lastUpdated) > 3600000) {
      fetchWeatherData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const formatUpdateTime = (dateString) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    return date.toLocaleTimeString(userSettings.language === "vi" ? "vi-VN" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: userSettings.timeFormat === "12h",
    })
  }

  return (
    <ScrollView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t("weather.loadingWeather")}</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherData}>
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : weatherData ? (
        <View style={styles.weatherContainer}>
          <View style={styles.weatherHeader}>
            <Text style={styles.locationText}>{weatherData.location}</Text>
            <Text style={styles.updateText}>
              {t("weather.updatedAt")} {formatUpdateTime(weatherData.lastUpdated)}
            </Text>
          </View>

          <View style={styles.weatherMain}>
            <WeatherIcon iconCode={weatherData.icon} size={100} />
            <Text style={styles.temperatureText}>{weatherData.temperature}°C</Text>
            <Text style={styles.descriptionText}>{weatherData.description}</Text>
          </View>

          <View style={styles.weatherDetails}>
            <View style={styles.detailItem}>
              <MaterialIcons name="opacity" size={24} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {t("weather.humidity")}: {weatherData.humidity}%
              </Text>
            </View>

            <View style={styles.detailItem}>
              <MaterialIcons name="air" size={24} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {t("weather.wind")}: {weatherData.windSpeed} m/s
              </Text>
            </View>
          </View>

          {weatherData.warning && (
            <View style={styles.warningContainer}>
              <MaterialIcons name="warning" size={24} color={COLORS.warning} />
              <Text style={styles.warningText}>{weatherData.warning}</Text>
            </View>
          )}

          {/* 5-Day Forecast Section */}
          {forecast.length > 0 && (
            <View style={styles.forecastSection}>
              <Text style={styles.forecastTitle}>{t("weather.forecast")}</Text>
              {forecast.map((item, index) => (
                <ForecastItem
                  key={index}
                  date={item.date}
                  icon={item.icon}
                  minTemp={item.minTemp}
                  maxTemp={item.maxTemp}
                  description={item.description}
                />
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.refreshButton} onPress={fetchWeatherData}>
            <MaterialIcons name="refresh" size={20} color={COLORS.white} />
            <Text style={styles.refreshButtonText}>{t("weather.update")}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <MaterialIcons name="cloud-off" size={48} color={COLORS.gray} />
          <Text style={styles.errorText}>{t("weather.noWeatherData")}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchWeatherData}>
            <Text style={styles.retryButtonText}>{t("weather.loadData")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.darkGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    marginTop: 16,
    color: COLORS.darkGray,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  weatherContainer: {
    padding: 16,
  },
  weatherHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  locationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },
  updateText: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 4,
  },
  weatherMain: {
    alignItems: "center",
    marginBottom: 24,
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 18,
    color: COLORS.darkGray,
    textTransform: "capitalize",
  },
  weatherDetails: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  warningContainer: {
    backgroundColor: COLORS.warning + "20",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  warningText: {
    marginLeft: 8,
    color: COLORS.darkGray,
    flex: 1,
  },
  forecastSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.text,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default WeatherScreen
