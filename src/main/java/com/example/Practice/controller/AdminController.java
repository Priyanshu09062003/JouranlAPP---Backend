package com.example.Practice.controller;

import com.example.Practice.entities.User;
import com.example.Practice.services.Userservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private Userservice userservice;

    @GetMapping("/all-users")
    public ResponseEntity<?> getAllusers()
    {
         List<User> all = userservice.getAll();
         if(all !=null && !all.isEmpty())
         {
             return new ResponseEntity<>(all,HttpStatus.OK);
         }
         return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public void createUser(@RequestBody User user)
    {
        userservice.saveAdmin(user);
    }
}
