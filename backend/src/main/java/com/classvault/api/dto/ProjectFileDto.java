package com.classvault.api.dto;

import com.classvault.api.entity.enums.FileType;
import java.time.LocalDateTime;

public class ProjectFileDto {

    private Long id;
    private FileType fileType;
    private String filePath;
    private Long fileSize;
    private LocalDateTime uploadedAt;

    public ProjectFileDto() {}

    public ProjectFileDto(Long id, FileType fileType, String filePath, Long fileSize, LocalDateTime uploadedAt) {
        this.id = id;
        this.fileType = fileType;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public FileType getFileType() { return fileType; }
    public void setFileType(FileType fileType) { this.fileType = fileType; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public static ProjectFileDtoBuilder builder() { return new ProjectFileDtoBuilder(); }

    public static class ProjectFileDtoBuilder {
        private Long id;
        private FileType fileType;
        private String filePath;
        private Long fileSize;
        private LocalDateTime uploadedAt;

        public ProjectFileDtoBuilder id(Long id) { this.id = id; return this; }
        public ProjectFileDtoBuilder fileType(FileType fileType) { this.fileType = fileType; return this; }
        public ProjectFileDtoBuilder filePath(String filePath) { this.filePath = filePath; return this; }
        public ProjectFileDtoBuilder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public ProjectFileDtoBuilder uploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; return this; }

        public ProjectFileDto build() {
            return new ProjectFileDto(id, fileType, filePath, fileSize, uploadedAt);
        }
    }
}
