package com.classvault.api.dto;

import com.classvault.api.entity.enums.ProjectStatus;
import com.classvault.api.entity.enums.Visibility;
import java.time.LocalDateTime;
import java.util.List;

public class ProjectDto {

    private Long id;
    private Long ownerStudentId;
    private String ownerName;
    private String ownerRollNumber;
    private String ownerPhotoUrl;
    private String title;
    private String description;
    private String readmeContent;
    private String technologyUsed;
    private String category;
    private Integer semester;
    private String githubRepoUrl;
    private String liveDemoUrl;
    private Visibility visibility;
    private ProjectStatus status;
    private String rejectionReason;
    private Boolean featured;
    private Long viewsCount;
    private Long downloadsCount;
    private Long likesCount;
    private Boolean isLikedByCurrentUser;
    private Boolean isBookmarkedByCurrentUser;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<ProjectFileDto> files;
    private List<CommentDto> comments;

    public ProjectDto() {}

    public ProjectDto(Long id, Long ownerStudentId, String ownerName, String ownerRollNumber, String ownerPhotoUrl,
                      String title, String description, String readmeContent, String technologyUsed, String category,
                      Integer semester, String githubRepoUrl, String liveDemoUrl, Visibility visibility,
                      ProjectStatus status, String rejectionReason, Boolean featured, Long viewsCount,
                      Long downloadsCount, Long likesCount, Boolean isLikedByCurrentUser,
                      Boolean isBookmarkedByCurrentUser, LocalDateTime createdAt, LocalDateTime updatedAt,
                      List<ProjectFileDto> files, List<CommentDto> comments) {
        this.id = id;
        this.ownerStudentId = ownerStudentId;
        this.ownerName = ownerName;
        this.ownerRollNumber = ownerRollNumber;
        this.ownerPhotoUrl = ownerPhotoUrl;
        this.title = title;
        this.description = description;
        this.readmeContent = readmeContent;
        this.technologyUsed = technologyUsed;
        this.category = category;
        this.semester = semester;
        this.githubRepoUrl = githubRepoUrl;
        this.liveDemoUrl = liveDemoUrl;
        this.visibility = visibility;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.featured = featured;
        this.viewsCount = viewsCount;
        this.downloadsCount = downloadsCount;
        this.likesCount = likesCount;
        this.isLikedByCurrentUser = isLikedByCurrentUser;
        this.isBookmarkedByCurrentUser = isBookmarkedByCurrentUser;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.files = files;
        this.comments = comments;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerStudentId() { return ownerStudentId; }
    public void setOwnerStudentId(Long ownerStudentId) { this.ownerStudentId = ownerStudentId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public String getOwnerRollNumber() { return ownerRollNumber; }
    public void setOwnerRollNumber(String ownerRollNumber) { this.ownerRollNumber = ownerRollNumber; }

    public String getOwnerPhotoUrl() { return ownerPhotoUrl; }
    public void setOwnerPhotoUrl(String ownerPhotoUrl) { this.ownerPhotoUrl = ownerPhotoUrl; }

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

    public Boolean getIsLikedByCurrentUser() { return isLikedByCurrentUser; }
    public void setIsLikedByCurrentUser(Boolean likedByCurrentUser) { isLikedByCurrentUser = likedByCurrentUser; }

    public Boolean getIsBookmarkedByCurrentUser() { return isBookmarkedByCurrentUser; }
    public void setIsBookmarkedByCurrentUser(Boolean bookmarkedByCurrentUser) { isBookmarkedByCurrentUser = bookmarkedByCurrentUser; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<ProjectFileDto> getFiles() { return files; }
    public void setFiles(List<ProjectFileDto> files) { this.files = files; }

    public List<CommentDto> getComments() { return comments; }
    public void setComments(List<CommentDto> comments) { this.comments = comments; }

    public static ProjectDtoBuilder builder() { return new ProjectDtoBuilder(); }

    public static class ProjectDtoBuilder {
        private Long id;
        private Long ownerStudentId;
        private String ownerName;
        private String ownerRollNumber;
        private String ownerPhotoUrl;
        private String title;
        private String description;
        private String readmeContent;
        private String technologyUsed;
        private String category;
        private Integer semester;
        private String githubRepoUrl;
        private String liveDemoUrl;
        private Visibility visibility;
        private ProjectStatus status;
        private String rejectionReason;
        private Boolean featured;
        private Long viewsCount;
        private Long downloadsCount;
        private Long likesCount;
        private Boolean isLikedByCurrentUser;
        private Boolean isBookmarkedByCurrentUser;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<ProjectFileDto> files;
        private List<CommentDto> comments;

        public ProjectDtoBuilder id(Long id) { this.id = id; return this; }
        public ProjectDtoBuilder ownerStudentId(Long ownerStudentId) { this.ownerStudentId = ownerStudentId; return this; }
        public ProjectDtoBuilder ownerName(String ownerName) { this.ownerName = ownerName; return this; }
        public ProjectDtoBuilder ownerRollNumber(String ownerRollNumber) { this.ownerRollNumber = ownerRollNumber; return this; }
        public ProjectDtoBuilder ownerPhotoUrl(String ownerPhotoUrl) { this.ownerPhotoUrl = ownerPhotoUrl; return this; }
        public ProjectDtoBuilder title(String title) { this.title = title; return this; }
        public ProjectDtoBuilder description(String description) { this.description = description; return this; }
        public ProjectDtoBuilder readmeContent(String readmeContent) { this.readmeContent = readmeContent; return this; }
        public ProjectDtoBuilder technologyUsed(String technologyUsed) { this.technologyUsed = technologyUsed; return this; }
        public ProjectDtoBuilder category(String category) { this.category = category; return this; }
        public ProjectDtoBuilder semester(Integer semester) { this.semester = semester; return this; }
        public ProjectDtoBuilder githubRepoUrl(String githubRepoUrl) { this.githubRepoUrl = githubRepoUrl; return this; }
        public ProjectDtoBuilder liveDemoUrl(String liveDemoUrl) { this.liveDemoUrl = liveDemoUrl; return this; }
        public ProjectDtoBuilder visibility(Visibility visibility) { this.visibility = visibility; return this; }
        public ProjectDtoBuilder status(ProjectStatus status) { this.status = status; return this; }
        public ProjectDtoBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public ProjectDtoBuilder featured(Boolean featured) { this.featured = featured; return this; }
        public ProjectDtoBuilder viewsCount(Long viewsCount) { this.viewsCount = viewsCount; return this; }
        public ProjectDtoBuilder downloadsCount(Long downloadsCount) { this.downloadsCount = downloadsCount; return this; }
        public ProjectDtoBuilder likesCount(Long likesCount) { this.likesCount = likesCount; return this; }
        public ProjectDtoBuilder isLikedByCurrentUser(Boolean isLikedByCurrentUser) { this.isLikedByCurrentUser = isLikedByCurrentUser; return this; }
        public ProjectDtoBuilder isBookmarkedByCurrentUser(Boolean isBookmarkedByCurrentUser) { this.isBookmarkedByCurrentUser = isBookmarkedByCurrentUser; return this; }
        public ProjectDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProjectDtoBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public ProjectDtoBuilder files(List<ProjectFileDto> files) { this.files = files; return this; }
        public ProjectDtoBuilder comments(List<CommentDto> comments) { this.comments = comments; return this; }

        public ProjectDto build() {
            return new ProjectDto(id, ownerStudentId, ownerName, ownerRollNumber, ownerPhotoUrl,
                    title, description, readmeContent, technologyUsed, category, semester, githubRepoUrl,
                    liveDemoUrl, visibility, status, rejectionReason, featured, viewsCount, downloadsCount,
                    likesCount, isLikedByCurrentUser, isBookmarkedByCurrentUser, createdAt, updatedAt, files, comments);
        }
    }
}
