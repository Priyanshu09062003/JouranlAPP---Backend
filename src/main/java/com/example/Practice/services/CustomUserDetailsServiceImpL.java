package com.example.Practice.services;

import com.example.Practice.entities.User;
import com.example.Practice.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class CustomUserDetailsServiceImpL implements UserDetailsService  {

    @Autowired
    private UserRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(String  username)
    {
        User user = userRepository.findByUsername(username);

        if(user != null)
        {
            UserDetails userDetails =org.springframework.security.core.userdetails.User.builder().username(user.getUsername())
                    .password(user.getPassword())
                    .roles(user.getRoles().toArray(new String[0]))
                    .build();

            return userDetails;
        }
        throw new UsernameNotFoundException("User not found with username" + username);
    }
}
