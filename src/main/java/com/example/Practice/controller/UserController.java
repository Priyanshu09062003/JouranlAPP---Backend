package com.example.Practice.controller;

import com.example.Practice.api.response.WeatherResponse;
import com.example.Practice.entities.User;
import com.example.Practice.services.Userservice;
import com.example.Practice.services.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private Userservice userservice;

    @GetMapping
    public List<User> getAllUsers()
    {
        return  userservice.getAll();
    }


    @PutMapping
    public ResponseEntity<?> updateUser(@RequestBody User user)
    {
//        User userInDb = userservice.findByUsername(username);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String name = authentication.getName();
        User userInDb = userservice.findByUsername(name);
        if(userInDb != null)
        {
            userInDb.setUsername(user.getUsername());
            userInDb.setPassword(user.getPassword());
            userservice.saveNewEntryUser(userInDb);
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/weather")
    public ResponseEntity<?> greeting()
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        WeatherResponse weatherResponse = weatherService.getWeather("Mumbai", "ceb2e357796dfe10819d3b51f8bac435");


        String greeting ="";
        if(weatherResponse != null)
        {
            greeting =", Weather feels like " + weatherResponse.getCurrent().getFeelslike();
        }
        return new ResponseEntity<>("Hi" + authentication.getName()+ greeting ,HttpStatus.OK);
    }



}
