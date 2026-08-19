package com.classvault.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_badges", uniqueConstraints = {
    @UniqueConstraint(name = "uk_student_badge", columnNames = {"student_id", "badge_id"})
})
public class StudentBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "awarded_at", updatable = false)
    private LocalDateTime awardedAt;

    public StudentBadge() {}

    public StudentBadge(Long id, Student student, Badge badge, LocalDateTime awardedAt) {
        this.id = id;
        this.student = student;
        this.badge = badge;
        this.awardedAt = awardedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (awardedAt == null) {
            awardedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Badge getBadge() { return badge; }
    public void setBadge(Badge badge) { this.badge = badge; }

    public LocalDateTime getAwardedAt() { return awardedAt; }
    public void setAwardedAt(LocalDateTime awardedAt) { this.awardedAt = awardedAt; }

    public static StudentBadgeBuilder builder() { return new StudentBadgeBuilder(); }

    public static class StudentBadgeBuilder {
        private Long id;
        private Student student;
        private Badge badge;
        private LocalDateTime awardedAt;

        public StudentBadgeBuilder id(Long id) { this.id = id; return this; }
        public StudentBadgeBuilder student(Student student) { this.student = student; return this; }
        public StudentBadgeBuilder badge(Badge badge) { this.badge = badge; return this; }
        public StudentBadgeBuilder awardedAt(LocalDateTime awardedAt) { this.awardedAt = awardedAt; return this; }

        public StudentBadge build() {
            return new StudentBadge(id, student, badge, awardedAt);
        }
    }
}
