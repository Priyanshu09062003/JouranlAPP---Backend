package com.example.Practice.repository;

import com.example.Practice.entities.ConfigJournalAppEntity;
import com.example.Practice.entities.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConfigJournalAppRepo extends MongoRepository<ConfigJournalAppEntity, ObjectId> {
}
