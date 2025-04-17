// Dịch vụ lấy dữ liệu thời tiết
// Trong môi trường thực tế, bạn sẽ sử dụng API như OpenWeatherMap hoặc WeatherAPI

// Hàm mô phỏng việc lấy dữ liệu thời tiết hiện tại
export const getCurrentWeather = async (location = 'Hanoi') => {
  // Mô phỏng API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Dữ liệu mẫu
      resolve({
        location: location,
        temperature: 28,
        condition: 'Sunny',
        humidity: 70,
        windSpeed: 10,
        icon: 'sunny',
        updatedAt: new Date().toISOString()
      });
    }, 500);
  });
};

// Hàm mô phỏng việc lấy dự báo thời tiết
export const getWeatherForecast = async (location = 'Hanoi', hours = 24) => {
  // Mô phỏng API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Tạo dữ liệu dự báo mẫu
      const forecast = [];
      const now = new Date();
      
      for (let i = 0; i < hours; i += 3) {
        const forecastTime = new Date(now);
        forecastTime.setHours(now.getHours() + i);
        
        // Tạo dữ liệu ngẫu nhiên cho mỗi khoảng thời gian
        const temp = Math.floor(25 + Math.random() * 10);
        const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
        const icons = ['sunny', 'partly-sunny', 'cloudy', 'rainy'];
        const randomIndex = Math.floor(Math.random() * conditions.length);
        
        forecast.push({
          time: `${forecastTime.getHours().toString().padStart(2, '0')}:00`,
          temperature: temp,
          condition: conditions[randomIndex],
          icon: icons[randomIndex],
          humidity: Math.floor(60 + Math.random() * 30),
          windSpeed: Math.floor(5 + Math.random() * 15)
        });
      }
      
      resolve(forecast);
    }, 700);
  });
};
