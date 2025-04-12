package com.example.Practice.services;

import com.example.Practice.Cache.AppCache;
import com.example.Practice.api.response.WeatherResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class WeatherService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private AppCache appCache;

//    @Value("weather.api.key")
//    private   String api_key ; // "ceb2e357796dfe10819d3b51f8bac435";

//    private static  String API = "http://api.weatherstack.com/current?access_key=API_KEY&query=CITY";

    public WeatherResponse getWeather(String city,String apikey)
    {
        String finalApi =appCache.APP_CACHE.get("weather_api").replace("API_KEY",apikey).replace("CITY",city);

        String requestBody = "{\n" +
                "    \"username\" : \"pu\",\n" +
                "    \"password\" : \"pu\"\n" +
                "}";
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.set("key","value");
        User.builder().username("p").password("few00").build();
        HttpEntity<String> httpEntity = new HttpEntity(requestBody,httpHeaders);
        ResponseEntity<WeatherResponse> response = restTemplate.exchange(finalApi, HttpMethod.POST, httpEntity, WeatherResponse.class);
        WeatherResponse body = response.getBody();
        return body;
//        above we deserializing the json reponse to normal java object
    }
}
