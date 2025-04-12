package com.example.Practice.entities;


import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "config_journal_app")
@Data
@NoArgsConstructor
@Getter
@Setter
public class ConfigJournalAppEntity {

    @Id
    private ObjectId id;

    @NonNull
    private String key;
    private String value;
    private LocalDateTime date;
}
