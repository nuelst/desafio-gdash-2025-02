package domain

import (
	"strings"
	"time"
)


type WeatherData struct {
	Timestamp   timestampString `json:"timestamp"`
	Location    Location        `json:"location"`
	Current     CurrentWeather  `json:"current"`
}
type timestampString time.Time

func (t *timestampString) UnmarshalJSON(b []byte) error {
	s := strings.Trim(string(b), `"`)
	s = strings.TrimSpace(s)

	if !strings.Contains(s, "Z") && !strings.Contains(s, "+") {
		if len(s) > 10 && s[len(s)-1] >= '0' && s[len(s)-1] <= '9' {
			s += "Z"
		}
	}

	formats := []string{
		time.RFC3339Nano,
		time.RFC3339,
		"2006-01-02T15:04:05.999999Z",
		"2006-01-02T15:04:05.999999",
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
	}

	for _, format := range formats {
		if parsed, err := time.Parse(format, s); err == nil {
			*t = timestampString(parsed)
			return nil
		}
	}

	// Tentar parsing com microssegundos
	if strings.Contains(s, ".") {
		parts := strings.Split(s, ".")
		if len(parts) == 2 {
			base := parts[0]
			frac := strings.TrimRight(parts[1], "Z")
			if len(frac) > 9 {
				frac = frac[:9]
			}
			for len(frac) < 9 {
				frac += "0"
			}
			newS := base + "." + frac + "Z"
			if parsed, err := time.Parse(time.RFC3339Nano, newS); err == nil {
				*t = timestampString(parsed)
				return nil
			}
		}
	}

	return &time.ParseError{
		Layout:     "ISO8601",
		Value:      s,
		LayoutElem: "timestamp",
		ValueElem:  s,
		Message:    "unable to parse timestamp",
	}
}

func (t timestampString) Time() time.Time {
	return time.Time(t)
}

func (t timestampString) Format(layout string) string {
	return time.Time(t).Format(layout)
}

type Location struct {
	Name      string  `json:"name"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type CurrentWeather struct {
	Temperature            float64 `json:"temperature"`
	Humidity               float64 `json:"humidity"`
	WindSpeed              float64 `json:"wind_speed"`
	WeatherCode            int     `json:"weather_code"`
	Condition              string  `json:"condition"`
	PrecipitationProbability float64 `json:"precipitation_probability"`
}

type WeatherLogRequest struct {
	Timestamp               string  `json:"timestamp"`
	Location                string  `json:"location"`
	Latitude                float64 `json:"latitude"`
	Longitude               float64 `json:"longitude"`
	Temperature             float64 `json:"temperature"`
	Humidity                float64 `json:"humidity"`
	WindSpeed               float64 `json:"windSpeed"`
	Condition               string  `json:"condition"`
	WeatherCode             int     `json:"weatherCode"`
	PrecipitationProbability float64 `json:"precipitationProbability"`
}

func (w *WeatherData) ToAPIRequest() WeatherLogRequest {
	return WeatherLogRequest{
		Timestamp:                w.Timestamp.Time().Format(time.RFC3339),
		Location:                 w.Location.Name,
		Latitude:                 w.Location.Latitude,
		Longitude:                w.Location.Longitude,
		Temperature:              w.Current.Temperature,
		Humidity:                 w.Current.Humidity,
		WindSpeed:                w.Current.WindSpeed,
		Condition:                w.Current.Condition,
		WeatherCode:              w.Current.WeatherCode,
		PrecipitationProbability: w.Current.PrecipitationProbability,
	}
}

