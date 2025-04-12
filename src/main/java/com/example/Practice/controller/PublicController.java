package com.example.Practice.controller;

import com.example.Practice.entities.User;
import com.example.Practice.services.CustomUserDetailsServiceImpL;
import com.example.Practice.services.Userservice;
import com.example.Practice.utilis.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
public class PublicController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsServiceImpL customUserDetailsServiceImpL;

    @Autowired
    private Userservice userservice;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/health-check")
    public  String health_check()
    {
        return "ok";
    }

    @PostMapping("/signup")
    public void signup(@RequestBody User user)
    {
        userservice.saveNewEntryUser(user);
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user)
    {
        try
        {
//          internally it is calling the CustomUserServiceIMpl and passwordEncoder whether the user present is db and is encoded
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(),user.getPassword()));
            UserDetails userDetails = customUserDetailsServiceImpL.loadUserByUsername(user.getUsername());
            String jwt = jwtUtil.generateToken(userDetails.getUsername());
            return new ResponseEntity<>(jwt, HttpStatus.OK);
        }
        catch(Exception e)
        {
            System.out.println("Exception Occured while createAuthenticationToken " +e);
            return new ResponseEntity<>("Incorrect username and password",HttpStatus.BAD_REQUEST);
        }
//        userservice.saveNewEntryUser(user);
    }

}
