package com.classvault.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Admin() {}

    public Admin(Long id, String name, String email, String passwordHash, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
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

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static AdminBuilder builder() { return new AdminBuilder(); }

    public static class AdminBuilder {
        private Long id;
        private String name;
        private String email;
        private String passwordHash;
        private LocalDateTime createdAt;

        public AdminBuilder id(Long id) { this.id = id; return this; }
        public AdminBuilder name(String name) { this.name = name; return this; }
        public AdminBuilder email(String email) { this.email = email; return this; }
        public AdminBuilder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public AdminBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Admin build() {
            return new Admin(id, name, email, passwordHash, createdAt);
        }
    }
}
