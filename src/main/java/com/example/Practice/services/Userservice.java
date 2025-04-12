package com.example.Practice.services;

import com.example.Practice.entities.User;
import com.example.Practice.repository.UserRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class Userservice {
    @Autowired
    private UserRepository userRepository;

    private static final PasswordEncoder passwordEnncoder = new BCryptPasswordEncoder();

    public void saveEntry(User user) {

        userRepository.save(user);
    }

    public void saveNewEntryUser(User user) {
        user.setPassword(passwordEnncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("USER"));
        userRepository.save(user);
    }

    public void saveAdmin(User user)
    {
        user.setPassword(passwordEnncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("USER","ADMIN"));
        userRepository.save(user);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(ObjectId id) {
        return userRepository.findById(id);
    }

    public void deleteById(ObjectId id) {
        userRepository.deleteById(id);
    }

    public User findByUsername(String userName) {
        return userRepository.findByUsername(userName);
    }



}
