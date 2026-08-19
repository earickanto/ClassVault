package com.classvault.api.service;

import com.classvault.api.entity.Student;
import com.classvault.api.repository.ProjectRepository;
import com.classvault.api.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;

    public LeaderboardService(StudentRepository studentRepository, ProjectRepository projectRepository) {
        this.studentRepository = studentRepository;
        this.projectRepository = projectRepository;
    }

    public static final double WEIGHT_PROJECT = 10.0;
    public static final double WEIGHT_LIKE = 5.0;
    public static final double WEIGHT_DOWNLOAD = 3.0;
    public static final double WEIGHT_VIEW = 1.0;

    public static class LeaderboardEntry {
        private int rank;
        private Long studentId;
        private String name;
        private String rollNumber;
        private String department;
        private String profilePhotoUrl;
        private int score;
        private int percentile;
        private long projectCount;
        private long likesCount;
        private long downloadsCount;
        private long viewsCount;

        public LeaderboardEntry() {}

        public LeaderboardEntry(int rank, Long studentId, String name, String rollNumber, String department,
                                String profilePhotoUrl, int score, int percentile, long projectCount,
                                long likesCount, long downloadsCount, long viewsCount) {
            this.rank = rank;
            this.studentId = studentId;
            this.name = name;
            this.rollNumber = rollNumber;
            this.department = department;
            this.profilePhotoUrl = profilePhotoUrl;
            this.score = score;
            this.percentile = percentile;
            this.projectCount = projectCount;
            this.likesCount = likesCount;
            this.downloadsCount = downloadsCount;
            this.viewsCount = viewsCount;
        }

        public int getRank() { return rank; }
        public Long getStudentId() { return studentId; }
        public String getName() { return name; }
        public String getRollNumber() { return rollNumber; }
        public String getDepartment() { return department; }
        public String getProfilePhotoUrl() { return profilePhotoUrl; }
        public int getScore() { return score; }
        public int getPercentile() { return percentile; }
        public long getProjectCount() { return projectCount; }
        public long getLikesCount() { return likesCount; }
        public long getDownloadsCount() { return downloadsCount; }
        public long getViewsCount() { return viewsCount; }

        public static LeaderboardEntryBuilder builder() { return new LeaderboardEntryBuilder(); }

        public static class LeaderboardEntryBuilder {
            private int rank;
            private Long studentId;
            private String name;
            private String rollNumber;
            private String department;
            private String profilePhotoUrl;
            private int score;
            private int percentile;
            private long projectCount;
            private long likesCount;
            private long downloadsCount;
            private long viewsCount;

            public LeaderboardEntryBuilder rank(int rank) { this.rank = rank; return this; }
            public LeaderboardEntryBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
            public LeaderboardEntryBuilder name(String name) { this.name = name; return this; }
            public LeaderboardEntryBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
            public LeaderboardEntryBuilder department(String department) { this.department = department; return this; }
            public LeaderboardEntryBuilder profilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; return this; }
            public LeaderboardEntryBuilder score(int score) { this.score = score; return this; }
            public LeaderboardEntryBuilder percentile(int percentile) { this.percentile = percentile; return this; }
            public LeaderboardEntryBuilder projectCount(long projectCount) { this.projectCount = projectCount; return this; }
            public LeaderboardEntryBuilder likesCount(long likesCount) { this.likesCount = likesCount; return this; }
            public LeaderboardEntryBuilder downloadsCount(long downloadsCount) { this.downloadsCount = downloadsCount; return this; }
            public LeaderboardEntryBuilder viewsCount(long viewsCount) { this.viewsCount = viewsCount; return this; }

            public LeaderboardEntry build() {
                return new LeaderboardEntry(rank, studentId, name, rollNumber, department, profilePhotoUrl,
                        score, percentile, projectCount, likesCount, downloadsCount, viewsCount);
            }
        }
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard() {
        List<Student> students = studentRepository.findAll();
        int totalStudents = students.size();
        List<com.classvault.api.entity.Project> allProjects = projectRepository.findAll();

        // Group project statistics by studentId in memory for ultra-fast response
        java.util.Map<Long, Long> projectCounts = allProjects.stream()
                .filter(p -> p.getOwnerStudent() != null)
                .collect(Collectors.groupingBy(p -> p.getOwnerStudent().getId(), Collectors.counting()));

        java.util.Map<Long, Long> likesCounts = allProjects.stream()
                .filter(p -> p.getOwnerStudent() != null)
                .collect(Collectors.groupingBy(p -> p.getOwnerStudent().getId(),
                        Collectors.summingLong(p -> p.getLikesCount() != null ? p.getLikesCount() : 0L)));

        java.util.Map<Long, Long> downloadsCounts = allProjects.stream()
                .filter(p -> p.getOwnerStudent() != null)
                .collect(Collectors.groupingBy(p -> p.getOwnerStudent().getId(),
                        Collectors.summingLong(p -> p.getDownloadsCount() != null ? p.getDownloadsCount() : 0L)));

        java.util.Map<Long, Long> viewsCounts = allProjects.stream()
                .filter(p -> p.getOwnerStudent() != null)
                .collect(Collectors.groupingBy(p -> p.getOwnerStudent().getId(),
                        Collectors.summingLong(p -> p.getViewsCount() != null ? p.getViewsCount() : 0L)));

        List<LeaderboardEntry> entries = students.stream().map(student -> {
            long projects = projectCounts.getOrDefault(student.getId(), 0L);
            long totalLikes = likesCounts.getOrDefault(student.getId(), 0L);
            long totalDownloads = downloadsCounts.getOrDefault(student.getId(), 0L);
            long totalViews = viewsCounts.getOrDefault(student.getId(), 0L);

            double score = (projects * WEIGHT_PROJECT) +
                           (totalLikes * WEIGHT_LIKE) +
                           (totalDownloads * WEIGHT_DOWNLOAD) +
                           (totalViews * WEIGHT_VIEW);

            return LeaderboardEntry.builder()
                    .studentId(student.getId())
                    .name(student.getName())
                    .rollNumber(student.getRollNumber())
                    .department(student.getDepartment())
                    .profilePhotoUrl(student.getProfilePhotoUrl())
                    .score((int) Math.round(score))
                    .projectCount(projects)
                    .likesCount(totalLikes)
                    .downloadsCount(totalDownloads)
                    .viewsCount(totalViews)
                    .build();
        })
        .sorted(Comparator.comparingInt(LeaderboardEntry::getScore).reversed())
        .collect(Collectors.toList());

        AtomicInteger rankCounter = new AtomicInteger(1);
        return entries.stream()
                .map(e -> {
                    int rank = rankCounter.getAndIncrement();
                    int percentile = 100;
                    if (totalStudents > 1) {
                        percentile = (int) Math.round(((double) (totalStudents - rank) / (totalStudents - 1)) * 100);
                    }
                    return LeaderboardEntry.builder()
                            .rank(rank)
                            .percentile(Math.max(0, Math.min(100, percentile)))
                            .studentId(e.getStudentId())
                            .name(e.getName())
                            .rollNumber(e.getRollNumber())
                            .department(e.getDepartment())
                            .profilePhotoUrl(e.getProfilePhotoUrl())
                            .score(e.getScore())
                            .projectCount(e.getProjectCount())
                            .likesCount(e.getLikesCount())
                            .downloadsCount(e.getDownloadsCount())
                            .viewsCount(e.getViewsCount())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public LeaderboardEntry getStudentRank(Long studentId) {
        List<LeaderboardEntry> leaderboard = getLeaderboard();
        return leaderboard.stream()
                .filter(e -> e.getStudentId().equals(studentId))
                .findFirst()
                .orElse(null);
    }
}
