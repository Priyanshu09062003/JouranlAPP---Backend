package com.example.Practice.services;

import com.example.Practice.entities.JournalEntry;
import com.example.Practice.entities.User;
import com.example.Practice.repository.JournalEntryRepo;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class JournalEntryService {
    @Autowired
    private JournalEntryRepo journalEntryRepo;

    @Autowired
    private Userservice userservice;

    private  static final Logger logger = LoggerFactory.getLogger(JournalEntryService.class);

    public void saveJorunal(JournalEntry journalEntry)
    {
        journalEntryRepo.save(journalEntry);
    }

    @Transactional
    public void saveEntry(JournalEntry journalEntry, String username) {
        try {
            User user = userservice.findByUsername(username);

            if (user == null) {
                throw new RuntimeException("User not found: " + username);
            }

            journalEntry.setDate(LocalDateTime.now());
            JournalEntry saved = journalEntryRepo.save(journalEntry);

            user.getJournalentries().add(saved);
            userservice.saveEntry(user);
        } catch (Exception e) {
            logger.info("haha");
            throw new RuntimeException("An error occurred while saving the entry.", e);
        }
    }

    public List<JournalEntry> getAll() {
        return journalEntryRepo.findAll();
    }

    public Optional<JournalEntry> findById(ObjectId id) {
        return journalEntryRepo.findById(id)
                .or(() -> {
                    System.out.println("Journal Entry with ID " + id + " not found.");
                    return Optional.empty();
                });
    }

    public boolean deleteById(ObjectId id, String username) throws Exception {
        try {
            User user = userservice.findByUsername(username);
            boolean removed = user.getJournalentries().removeIf(entry -> entry.getId().equals(id));

            if (removed) {
                userservice.saveEntry(user);
                journalEntryRepo.deleteById(id);
                return true;
            }
        } catch (RuntimeException e) {
            throw new Exception("Failed to delete journal entry", e);
        }
        return false;
    }

    public boolean updateUserEntry(JournalEntry entry, String username) {
        User user = userservice.findByUsername(username);

        JournalEntry find = user.getJournalentries().stream()
                .filter(x -> x.getId().equals(entry.getId()))
                .findFirst()
                .orElse(null);

        if (find != null) {
            find.setTitle(entry.getTitle());
            find.setContent(entry.getContent());

            // Persist changes
            userservice.saveEntry(user);
            return true;
        } else {
            System.out.println("Journal entry not found for update.");
        }
        return false;
    }
}
