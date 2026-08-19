package com.classvault.api.service;

import com.classvault.api.dto.CommentDto;
import com.classvault.api.dto.ProjectDto;
import com.classvault.api.dto.ProjectFileDto;
import com.classvault.api.entity.*;
import com.classvault.api.entity.enums.FileType;
import com.classvault.api.entity.enums.NotificationType;
import com.classvault.api.entity.enums.ProjectStatus;
import com.classvault.api.entity.enums.Visibility;
import com.classvault.api.exception.ResourceNotFoundException;
import com.classvault.api.repository.*;
import com.classvault.api.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectFileRepository projectFileRepository;
    private final StudentRepository studentRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final BookmarkRepository bookmarkRepository;
    private final NotificationRepository notificationRepository;
    private final FileService fileService;

    public ProjectService(ProjectRepository projectRepository, ProjectFileRepository projectFileRepository,
                          StudentRepository studentRepository, LikeRepository likeRepository,
                          CommentRepository commentRepository, BookmarkRepository bookmarkRepository,
                          NotificationRepository notificationRepository, FileService fileService) {
        this.projectRepository = projectRepository;
        this.projectFileRepository = projectFileRepository;
        this.studentRepository = studentRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.notificationRepository = notificationRepository;
        this.fileService = fileService;
    }

    @Transactional(readOnly = true)
    public Page<ProjectDto> getPublicProjects(String query, String category, Integer semester, Pageable pageable, UserPrincipal currentUser) {
        String q = (query != null && !query.isBlank()) ? query.trim() : "";
        String cat = (category != null && !category.isBlank() && !category.equalsIgnoreCase("ALL")) ? category.trim() : null;
        
        Page<Project> projectsPage = projectRepository.searchPublicProjectsFiltered(q, cat, semester, pageable);

        List<ProjectDto> dtos = projectsPage.getContent().stream()
                .map(p -> mapToDto(p, currentUser))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, projectsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getStudentProjects(Long studentId, UserPrincipal currentUser) {
        List<Project> projects = projectRepository.findByOwnerStudentId(studentId);

        return projects.stream()
                .filter(p -> p.getVisibility() == Visibility.PUBLIC ||
                             (currentUser != null && (currentUser.getId().equals(studentId) || "ROLE_ADMIN".equals(currentUser.getRole()))))
                .map(p -> mapToDto(p, currentUser))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));

        if (project.getVisibility() == Visibility.PRIVATE) {
            if (currentUser == null || (!currentUser.getId().equals(project.getOwnerStudent().getId()) && !"ROLE_ADMIN".equals(currentUser.getRole()))) {
                throw new AccessDeniedException("Access Denied: Private project can only be viewed by owner or admin");
            }
        }

        return mapToDto(project, currentUser);
    }

    @Transactional
    public ProjectDto createProject(ProjectDto dto, UserPrincipal currentUser) {
        Student owner = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Project project = Project.builder()
                .ownerStudent(owner)
                .title(dto.getTitle())
                .description(dto.getDescription())
                .readmeContent(dto.getReadmeContent())
                .technologyUsed(dto.getTechnologyUsed())
                .category(dto.getCategory() != null ? dto.getCategory() : "Web Application")
                .semester(dto.getSemester() != null ? dto.getSemester() : 6)
                .githubRepoUrl(dto.getGithubRepoUrl())
                .liveDemoUrl(dto.getLiveDemoUrl())
                .visibility(dto.getVisibility() != null ? dto.getVisibility() : Visibility.PUBLIC)
                .status(dto.getStatus() != null ? dto.getStatus() : ProjectStatus.PENDING)
                .featured(false)
                .viewsCount(0L)
                .downloadsCount(0L)
                .likesCount(0L)
                .build();

        Project saved = projectRepository.save(project);
        return mapToDto(saved, currentUser);
    }

    @Transactional
    public ProjectDto updateProject(Long id, ProjectDto dto, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOwnerStudent().getId().equals(currentUser.getId()) && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access Denied: You can only edit your own projects");
        }

        if (dto.getTitle() != null) project.setTitle(dto.getTitle());
        if (dto.getDescription() != null) project.setDescription(dto.getDescription());
        if (dto.getReadmeContent() != null) project.setReadmeContent(dto.getReadmeContent());
        if (dto.getTechnologyUsed() != null) project.setTechnologyUsed(dto.getTechnologyUsed());
        if (dto.getCategory() != null) project.setCategory(dto.getCategory());
        if (dto.getSemester() != null) project.setSemester(dto.getSemester());
        if (dto.getGithubRepoUrl() != null) project.setGithubRepoUrl(dto.getGithubRepoUrl());
        if (dto.getLiveDemoUrl() != null) project.setLiveDemoUrl(dto.getLiveDemoUrl());
        if (dto.getVisibility() != null) project.setVisibility(dto.getVisibility());
        if (dto.getStatus() != null) project.setStatus(dto.getStatus());

        Project saved = projectRepository.save(project);
        return mapToDto(saved, currentUser);
    }

    @Transactional
    public void deleteProject(Long id, UserPrincipal currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + id));

        if (!project.getOwnerStudent().getId().equals(currentUser.getId()) && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access Denied: You can only delete your own projects");
        }

        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDto uploadProjectFile(Long projectId, FileType fileType, MultipartFile file, UserPrincipal currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!project.getOwnerStudent().getId().equals(currentUser.getId()) && !"ROLE_ADMIN".equals(currentUser.getRole())) {
            throw new AccessDeniedException("Access Denied: Cannot upload files to this project");
        }

        String filePath = fileService.storeFile(file, fileType, "project-files/" + projectId);

        ProjectFile projectFile = ProjectFile.builder()
                .project(project)
                .fileType(fileType)
                .filePath(filePath)
                .fileSize(file.getSize())
                .build();

        projectFileRepository.save(projectFile);
        return mapToDto(project, currentUser);
    }

    @Transactional
    public void incrementViews(Long projectId) {
        projectRepository.findById(projectId).ifPresent(project -> {
            project.setViewsCount(project.getViewsCount() + 1);
            projectRepository.save(project);
        });
    }

    @Transactional
    public void incrementDownloads(Long projectId) {
        projectRepository.findById(projectId).ifPresent(project -> {
            project.setDownloadsCount(project.getDownloadsCount() + 1);
            projectRepository.save(project);
        });
    }

    @Transactional
    public boolean toggleLike(Long projectId, UserPrincipal currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Optional<Like> existingLike = likeRepository.findByProjectIdAndStudentId(projectId, currentUser.getId());

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            project.setLikesCount(Math.max(0, project.getLikesCount() - 1));
            projectRepository.save(project);
            return false;
        } else {
            Like newLike = Like.builder()
                    .project(project)
                    .student(student)
                    .build();
            likeRepository.save(newLike);

            project.setLikesCount(project.getLikesCount() + 1);
            projectRepository.save(project);

            if (!project.getOwnerStudent().getId().equals(student.getId())) {
                Notification notif = Notification.builder()
                        .student(project.getOwnerStudent())
                        .type(NotificationType.PROJECT_LIKE)
                        .message(student.getName() + " liked your project: " + project.getTitle())
                        .build();
                notificationRepository.save(notif);
            }
            return true;
        }
    }

    @Transactional
    public boolean toggleBookmark(Long projectId, UserPrincipal currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Optional<Bookmark> existing = bookmarkRepository.findByProjectIdAndStudentId(projectId, currentUser.getId());
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return false;
        } else {
            Bookmark bookmark = Bookmark.builder()
                    .project(project)
                    .student(student)
                    .build();
            bookmarkRepository.save(bookmark);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getBookmarkedProjects(UserPrincipal currentUser) {
        List<Bookmark> bookmarks = bookmarkRepository.findByStudentIdOrderByCreatedAtDesc(currentUser.getId());
        return bookmarks.stream()
                .map(b -> mapToDto(b.getProject(), currentUser))
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentDto addComment(Long projectId, String content, UserPrincipal currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Student student = studentRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Comment comment = Comment.builder()
                .project(project)
                .student(student)
                .content(content)
                .build();

        Comment saved = commentRepository.save(comment);

        if (!project.getOwnerStudent().getId().equals(student.getId())) {
            Notification notif = Notification.builder()
                    .student(project.getOwnerStudent())
                    .type(NotificationType.PROJECT_COMMENT)
                    .message(student.getName() + " commented: " + (content.length() > 50 ? content.substring(0, 50) + "..." : content))
                    .build();
            notificationRepository.save(notif);
        }

        return CommentDto.builder()
                .id(saved.getId())
                .projectId(project.getId())
                .studentId(student.getId())
                .studentName(student.getName())
                .studentRollNumber(student.getRollNumber())
                .studentPhotoUrl(student.getProfilePhotoUrl())
                .content(saved.getContent())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<CommentDto> getProjectComments(Long projectId) {
        return commentRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream()
                .map(c -> CommentDto.builder()
                        .id(c.getId())
                        .projectId(c.getProject().getId())
                        .studentId(c.getStudent().getId())
                        .studentName(c.getStudent().getName())
                        .studentRollNumber(c.getStudent().getRollNumber())
                        .studentPhotoUrl(c.getStudent().getProfilePhotoUrl())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public ProjectDto mapToDto(Project project, UserPrincipal currentUser) {
        boolean liked = false;
        boolean bookmarked = false;

        if (currentUser != null) {
            liked = likeRepository.existsByProjectIdAndStudentId(project.getId(), currentUser.getId());
            bookmarked = bookmarkRepository.existsByProjectIdAndStudentId(project.getId(), currentUser.getId());
        }

        List<ProjectFileDto> fileDtos = project.getFiles().stream()
                .map(f -> ProjectFileDto.builder()
                        .id(f.getId())
                        .fileType(f.getFileType())
                        .filePath(f.getFilePath())
                        .fileSize(f.getFileSize())
                        .uploadedAt(f.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        List<CommentDto> commentDtos = project.getComments().stream()
                .map(c -> CommentDto.builder()
                        .id(c.getId())
                        .projectId(project.getId())
                        .studentId(c.getStudent().getId())
                        .studentName(c.getStudent().getName())
                        .studentRollNumber(c.getStudent().getRollNumber())
                        .studentPhotoUrl(c.getStudent().getProfilePhotoUrl())
                        .content(c.getContent())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ProjectDto.builder()
                .id(project.getId())
                .ownerStudentId(project.getOwnerStudent().getId())
                .ownerName(project.getOwnerStudent().getName())
                .ownerRollNumber(project.getOwnerStudent().getRollNumber())
                .ownerPhotoUrl(project.getOwnerStudent().getProfilePhotoUrl())
                .title(project.getTitle())
                .description(project.getDescription())
                .readmeContent(project.getReadmeContent())
                .technologyUsed(project.getTechnologyUsed())
                .category(project.getCategory())
                .semester(project.getSemester())
                .githubRepoUrl(project.getGithubRepoUrl())
                .liveDemoUrl(project.getLiveDemoUrl())
                .visibility(project.getVisibility())
                .status(project.getStatus())
                .rejectionReason(project.getRejectionReason())
                .featured(project.getFeatured())
                .viewsCount(project.getViewsCount())
                .downloadsCount(project.getDownloadsCount())
                .likesCount(project.getLikesCount())
                .isLikedByCurrentUser(liked)
                .isBookmarkedByCurrentUser(bookmarked)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .files(fileDtos)
                .comments(commentDtos)
                .build();
    }
}
