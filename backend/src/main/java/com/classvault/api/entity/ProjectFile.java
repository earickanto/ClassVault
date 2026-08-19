package com.classvault.api.entity;

import com.classvault.api.entity.enums.FileType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_files")
public class ProjectFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Enumerated(EnumType.STRING)
    @Column(name = "file_type", nullable = false, length = 20)
    private FileType fileType;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "uploaded_at", updatable = false)
    private LocalDateTime uploadedAt;

    public ProjectFile() {}

    public ProjectFile(Long id, Project project, FileType fileType, String filePath, Long fileSize, LocalDateTime uploadedAt) {
        this.id = id;
        this.project = project;
        this.fileType = fileType;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) {
            uploadedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public FileType getFileType() { return fileType; }
    public void setFileType(FileType fileType) { this.fileType = fileType; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public static ProjectFileBuilder builder() { return new ProjectFileBuilder(); }

    public static class ProjectFileBuilder {
        private Long id;
        private Project project;
        private FileType fileType;
        private String filePath;
        private Long fileSize;
        private LocalDateTime uploadedAt;

        public ProjectFileBuilder id(Long id) { this.id = id; return this; }
        public ProjectFileBuilder project(Project project) { this.project = project; return this; }
        public ProjectFileBuilder fileType(FileType fileType) { this.fileType = fileType; return this; }
        public ProjectFileBuilder filePath(String filePath) { this.filePath = filePath; return this; }
        public ProjectFileBuilder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public ProjectFileBuilder uploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; return this; }

        public ProjectFile build() {
            return new ProjectFile(id, project, fileType, filePath, fileSize, uploadedAt);
        }
    }
}
