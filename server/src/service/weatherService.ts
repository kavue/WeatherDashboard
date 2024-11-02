import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}
// TODO: Define a class for the Weather object
class Weather {
  temperature: number;
  description: string;
  windSpeed: number;
  humidity: number;

  constructor(temperature: number, description: string, windSpeed: number, humidity: number) {
    this.temperature = temperature;
    this.description = description;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL: string;
  private apiKey: string;
  private cityName: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org/data/2.5'
    this.apiKey = process.env.API_KEY || '';
    this.cityName = '';
  }
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise<any> {
    const geocodeUrl = this.buildGeocodeQuery(query);
    const response = await fetch(geocodeUrl);
    if (!response.ok) {
        throw new Error(`Error fetching location data: ${response.statusText}`);
    }
    return response.json();
}
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates[]): Coordinates {
    if (locationData.length === 0) {
        throw new Error('No location data found');
    }
    return {
        lat: locationData[0].lat,
        lon: locationData[0].lon,
    };
}
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(query: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
  }
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}`;
  }
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherUrl = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherUrl);
    if (!response.ok) {
        throw new Error(`Error fetching weather data: ${response.statusText}`);
    }
    return response.json();
}
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const currentWeather = response.list[0];
    return new Weather(
      currentWeather.main.temp,
      currentWeather.weather[0].description,
      currentWeather.wind.speed,
      currentWeather.main.humidity
    );
  }
  // TODO: Complete buildForecastArray method
  private buildForecastArray(weatherData: any[]) {
    const forecast = weatherData.slice(1, 6).map((weather) => {
      return {
        time: weather.dt_txt,
        temperature: weather.main.temp,
        description: weather.weather[0].description,
        windSpeed: weather.wind.speed,
        humidity: weather.main.humidity,
      };
    });
    return forecast
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<any> {
    this.cityName = city;
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecast = this.buildForecastArray(currentWeather, weatherData.list);
    return {
      currentWeather,
      forecast,
    };
  }
}

export default new WeatherService();
