package com.classvault.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "badges")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String icon;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Badge() {}

    public Badge(Long id, String name, String icon, String description, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static BadgeBuilder builder() { return new BadgeBuilder(); }

    public static class BadgeBuilder {
        private Long id;
        private String name;
        private String icon;
        private String description;
        private LocalDateTime createdAt;

        public BadgeBuilder id(Long id) { this.id = id; return this; }
        public BadgeBuilder name(String name) { this.name = name; return this; }
        public BadgeBuilder icon(String icon) { this.icon = icon; return this; }
        public BadgeBuilder description(String description) { this.description = description; return this; }
        public BadgeBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Badge build() {
            return new Badge(id, name, icon, description, createdAt);
        }
    }
}
