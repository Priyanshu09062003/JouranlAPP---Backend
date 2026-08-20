package com.example.Practice.repository;

import com.example.Practice.entities.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JournalEntryRepo extends JpaRepository<JournalEntry, Long> {
}
