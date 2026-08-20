package com.example.Practice.entities;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "config_journal_app")
@Data
@NoArgsConstructor
@RequiredArgsConstructor
@Getter
@Setter
public class ConfigJournalAppEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", nullable = false)
    @NonNull
    private String key;

    private String value;
    private LocalDateTime date;
}
