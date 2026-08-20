package com.example.Practice.repository;

import com.example.Practice.entities.ConfigJournalAppEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfigJournalAppRepo extends JpaRepository<ConfigJournalAppEntity, Long> {
}
