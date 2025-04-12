package com.example.Practice.controller;

import com.example.Practice.entities.JournalEntry;
import com.example.Practice.entities.User;
import com.example.Practice.services.JournalEntryService;
import com.example.Practice.services.Userservice;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/journal")
public class JournalEntryControllerv2 {

    @Autowired
    private JournalEntryService journalEntryService;

    @Autowired
    private Userservice userservice;

    @GetMapping
    public ResponseEntity<?> getAllJournalEntriesOfUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userservice.findByUsername(username);
        List<JournalEntry> all = user.getJournalentries();
        if (!all.isEmpty() && all != null) {
            return new ResponseEntity<>(all, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @PostMapping
    public ResponseEntity<JournalEntry> createEntry(@RequestBody JournalEntry myEntry) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userName = authentication.getName();
            journalEntryService.saveEntry(myEntry, userName);
            return new ResponseEntity<>(myEntry, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

// Check this not working
    @GetMapping("/id/{myId}")
    public ResponseEntity<JournalEntry> getSingle(@PathVariable ObjectId myId) {
        // ObjectId objectId = new ObjectId(myId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User byUsername = userservice.findByUsername(username);
        List<JournalEntry> collect = byUsername.getJournalentries().stream().filter(x -> x.getId().equals(myId)).collect(Collectors.toList());
        if (!collect.isEmpty()) {
            Optional<JournalEntry> journalEntry = journalEntryService.findById(myId);
            if (journalEntry.isPresent()) {
                return new ResponseEntity<>(journalEntry.get(), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/id/{ID}")
    public ResponseEntity<?> setSingle(@PathVariable ObjectId ID) throws Exception {
        // there is no cascade delete in mongodb we have to manually do it.
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        boolean removed =journalEntryService.deleteById(ID, username);
        if(removed)
        {
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/id/{ID}")
    public ResponseEntity<JournalEntry> setSingle(@PathVariable ObjectId ID, @RequestBody JournalEntry newEntry) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        JournalEntry old = journalEntryService.findById(ID).orElse(null);
        if (old != null) {
            old.setTitle(newEntry.getTitle() != null && !newEntry.getTitle().equals("") ? newEntry.getTitle() : old.getTitle());
            old.setContent(newEntry.getContent() != null && !newEntry.getContent().equals("") ? newEntry.getContent() : old.getContent());
//            journalEntryService.saveEntry(old, user); // no need for user as old as it reference which come from db
            journalEntryService.updateUserEntry(old,username);
            journalEntryService.saveJorunal(old);
            return new ResponseEntity<>(old, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

}
