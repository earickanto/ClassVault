package com.classvault.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "likes", uniqueConstraints = {
    @UniqueConstraint(name = "uk_project_student", columnNames = {"project_id", "student_id"})
})
public class Like {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Like() {}

    public Like(Long id, Project project, Student student, LocalDateTime createdAt) {
        this.id = id;
        this.project = project;
        this.student = student;
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

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static LikeBuilder builder() { return new LikeBuilder(); }

    public static class LikeBuilder {
        private Long id;
        private Project project;
        private Student student;
        private LocalDateTime createdAt;

        public LikeBuilder id(Long id) { this.id = id; return this; }
        public LikeBuilder project(Project project) { this.project = project; return this; }
        public LikeBuilder student(Student student) { this.student = student; return this; }
        public LikeBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Like build() {
            return new Like(id, project, student, createdAt);
        }
    }
}
