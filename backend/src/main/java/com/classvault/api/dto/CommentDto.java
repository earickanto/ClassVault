package com.classvault.api.dto;

import java.time.LocalDateTime;

public class CommentDto {

    private Long id;
    private Long projectId;
    private Long studentId;
    private String studentName;
    private String studentRollNumber;
    private String studentPhotoUrl;
    private String content;
    private LocalDateTime createdAt;

    public CommentDto() {}

    public CommentDto(Long id, Long projectId, Long studentId, String studentName, String studentRollNumber,
                      String studentPhotoUrl, String content, LocalDateTime createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentRollNumber = studentRollNumber;
        this.studentPhotoUrl = studentPhotoUrl;
        this.content = content;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public String getStudentPhotoUrl() { return studentPhotoUrl; }
    public void setStudentPhotoUrl(String studentPhotoUrl) { this.studentPhotoUrl = studentPhotoUrl; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static CommentDtoBuilder builder() { return new CommentDtoBuilder(); }

    public static class CommentDtoBuilder {
        private Long id;
        private Long projectId;
        private Long studentId;
        private String studentName;
        private String studentRollNumber;
        private String studentPhotoUrl;
        private String content;
        private LocalDateTime createdAt;

        public CommentDtoBuilder id(Long id) { this.id = id; return this; }
        public CommentDtoBuilder projectId(Long projectId) { this.projectId = projectId; return this; }
        public CommentDtoBuilder studentId(Long studentId) { this.studentId = studentId; return this; }
        public CommentDtoBuilder studentName(String studentName) { this.studentName = studentName; return this; }
        public CommentDtoBuilder studentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; return this; }
        public CommentDtoBuilder studentPhotoUrl(String studentPhotoUrl) { this.studentPhotoUrl = studentPhotoUrl; return this; }
        public CommentDtoBuilder content(String content) { this.content = content; return this; }
        public CommentDtoBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public CommentDto build() {
            return new CommentDto(id, projectId, studentId, studentName, studentRollNumber, studentPhotoUrl, content, createdAt);
        }
    }
}
