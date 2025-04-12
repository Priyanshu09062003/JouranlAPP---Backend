package com.example.Practice.entities;

import lombok.*;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Data
//@Getter
//@Setter
@NoArgsConstructor
@Document(collection = "journal_entries")
public class JournalEntry {

    @Id
    private ObjectId id;

    @NonNull
    private String title;

    private String content;

    private LocalDateTime date;


}
