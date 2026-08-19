package com.classvault.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leaderboard_snapshot")
public class LeaderboardSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "rank_position", nullable = false)
    private Integer rankPosition;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    public LeaderboardSnapshot() {}

    public LeaderboardSnapshot(Long id, Student student, Integer rankPosition, Integer score, LocalDateTime generatedAt) {
        this.id = id;
        this.student = student;
        this.rankPosition = rankPosition;
        this.score = score;
        this.generatedAt = generatedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Integer getRankPosition() { return rankPosition; }
    public void setRankPosition(Integer rankPosition) { this.rankPosition = rankPosition; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public static LeaderboardSnapshotBuilder builder() { return new LeaderboardSnapshotBuilder(); }

    public static class LeaderboardSnapshotBuilder {
        private Long id;
        private Student student;
        private Integer rankPosition;
        private Integer score;
        private LocalDateTime generatedAt;

        public LeaderboardSnapshotBuilder id(Long id) { this.id = id; return this; }
        public LeaderboardSnapshotBuilder student(Student student) { this.student = student; return this; }
        public LeaderboardSnapshotBuilder rankPosition(Integer rankPosition) { this.rankPosition = rankPosition; return this; }
        public LeaderboardSnapshotBuilder score(Integer score) { this.score = score; return this; }
        public LeaderboardSnapshotBuilder generatedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; return this; }

        public LeaderboardSnapshot build() {
            return new LeaderboardSnapshot(id, student, rankPosition, score, generatedAt);
        }
    }
}
