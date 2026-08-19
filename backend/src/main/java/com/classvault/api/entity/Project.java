package com.classvault.api.entity;

import com.classvault.api.entity.enums.ProjectStatus;
import com.classvault.api.entity.enums.Visibility;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_student_id", nullable = false)
    private Student ownerStudent;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "readme_content", columnDefinition = "TEXT")
    private String readmeContent;

    @Column(name = "technology_used", nullable = false, length = 255)
    private String technologyUsed;

    @Column(nullable = false, length = 100)
    private String category;

    @Column(nullable = false)
    private Integer semester = 6;

    @Column(name = "github_repo_url")
    private String githubRepoUrl;

    @Column(name = "live_demo_url")
    private String liveDemoUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Visibility visibility = Visibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status = ProjectStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(name = "views_count", nullable = false)
    private Long viewsCount = 0L;

    @Column(name = "downloads_count", nullable = false)
    private Long downloadsCount = 0L;

    @Column(name = "likes_count", nullable = false)
    private Long likesCount = 0L;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectFile> files = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Project() {}

    public Project(Long id, Student ownerStudent, String title, String description, String readmeContent,
                   String technologyUsed, String category, Integer semester, String githubRepoUrl, String liveDemoUrl,
                   Visibility visibility, ProjectStatus status, String rejectionReason, Boolean featured,
                   Long viewsCount, Long downloadsCount, Long likesCount, List<ProjectFile> files,
                   List<Comment> comments, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.ownerStudent = ownerStudent;
        this.title = title;
        this.description = description;
        this.readmeContent = readmeContent;
        this.technologyUsed = technologyUsed;
        this.category = category;
        this.semester = semester != null ? semester : 6;
        this.githubRepoUrl = githubRepoUrl;
        this.liveDemoUrl = liveDemoUrl;
        this.visibility = visibility != null ? visibility : Visibility.PUBLIC;
        this.status = status != null ? status : ProjectStatus.PENDING;
        this.rejectionReason = rejectionReason;
        this.featured = featured != null ? featured : false;
        this.viewsCount = viewsCount != null ? viewsCount : 0L;
        this.downloadsCount = downloadsCount != null ? downloadsCount : 0L;
        this.likesCount = likesCount != null ? likesCount : 0L;
        this.files = files != null ? files : new ArrayList<>();
        this.comments = comments != null ? comments : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getOwnerStudent() { return ownerStudent; }
    public void setOwnerStudent(Student ownerStudent) { this.ownerStudent = ownerStudent; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getReadmeContent() { return readmeContent; }
    public void setReadmeContent(String readmeContent) { this.readmeContent = readmeContent; }

    public String getTechnologyUsed() { return technologyUsed; }
    public void setTechnologyUsed(String technologyUsed) { this.technologyUsed = technologyUsed; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getGithubRepoUrl() { return githubRepoUrl; }
    public void setGithubRepoUrl(String githubRepoUrl) { this.githubRepoUrl = githubRepoUrl; }

    public String getLiveDemoUrl() { return liveDemoUrl; }
    public void setLiveDemoUrl(String liveDemoUrl) { this.liveDemoUrl = liveDemoUrl; }

    public Visibility getVisibility() { return visibility; }
    public void setVisibility(Visibility visibility) { this.visibility = visibility; }

    public ProjectStatus getStatus() { return status; }
    public void setStatus(ProjectStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Long getViewsCount() { return viewsCount; }
    public void setViewsCount(Long viewsCount) { this.viewsCount = viewsCount; }

    public Long getDownloadsCount() { return downloadsCount; }
    public void setDownloadsCount(Long downloadsCount) { this.downloadsCount = downloadsCount; }

    public Long getLikesCount() { return likesCount; }
    public void setLikesCount(Long likesCount) { this.likesCount = likesCount; }

    public List<ProjectFile> getFiles() { return files; }
    public void setFiles(List<ProjectFile> files) { this.files = files; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ProjectBuilder builder() { return new ProjectBuilder(); }

    public static class ProjectBuilder {
        private Long id;
        private Student ownerStudent;
        private String title;
        private String description;
        private String readmeContent;
        private String technologyUsed;
        private String category;
        private Integer semester = 6;
        private String githubRepoUrl;
        private String liveDemoUrl;
        private Visibility visibility = Visibility.PUBLIC;
        private ProjectStatus status = ProjectStatus.PENDING;
        private String rejectionReason;
        private Boolean featured = false;
        private Long viewsCount = 0L;
        private Long downloadsCount = 0L;
        private Long likesCount = 0L;
        private List<ProjectFile> files = new ArrayList<>();
        private List<Comment> comments = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ProjectBuilder id(Long id) { this.id = id; return this; }
        public ProjectBuilder ownerStudent(Student ownerStudent) { this.ownerStudent = ownerStudent; return this; }
        public ProjectBuilder title(String title) { this.title = title; return this; }
        public ProjectBuilder description(String description) { this.description = description; return this; }
        public ProjectBuilder readmeContent(String readmeContent) { this.readmeContent = readmeContent; return this; }
        public ProjectBuilder technologyUsed(String technologyUsed) { this.technologyUsed = technologyUsed; return this; }
        public ProjectBuilder category(String category) { this.category = category; return this; }
        public ProjectBuilder semester(Integer semester) { this.semester = semester; return this; }
        public ProjectBuilder githubRepoUrl(String githubRepoUrl) { this.githubRepoUrl = githubRepoUrl; return this; }
        public ProjectBuilder liveDemoUrl(String liveDemoUrl) { this.liveDemoUrl = liveDemoUrl; return this; }
        public ProjectBuilder visibility(Visibility visibility) { this.visibility = visibility; return this; }
        public ProjectBuilder status(ProjectStatus status) { this.status = status; return this; }
        public ProjectBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public ProjectBuilder featured(Boolean featured) { this.featured = featured; return this; }
        public ProjectBuilder viewsCount(Long viewsCount) { this.viewsCount = viewsCount; return this; }
        public ProjectBuilder downloadsCount(Long downloadsCount) { this.downloadsCount = downloadsCount; return this; }
        public ProjectBuilder likesCount(Long likesCount) { this.likesCount = likesCount; return this; }
        public ProjectBuilder files(List<ProjectFile> files) { this.files = files; return this; }
        public ProjectBuilder comments(List<Comment> comments) { this.comments = comments; return this; }
        public ProjectBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProjectBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Project build() {
            return new Project(id, ownerStudent, title, description, readmeContent, technologyUsed, category, semester,
                    githubRepoUrl, liveDemoUrl, visibility, status, rejectionReason, featured, viewsCount,
                    downloadsCount, likesCount, files, comments, createdAt, updatedAt);
        }
    }
}
