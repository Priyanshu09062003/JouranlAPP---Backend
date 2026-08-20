package com.example.Practice.entities;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "journal_entries")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NonNull
    private String title;

    private String content;

    private LocalDateTime date;
}
