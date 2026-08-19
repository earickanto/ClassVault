package com.classvault.api.controller;

import com.classvault.api.dto.ApiResponse;
import com.classvault.api.dto.CommentDto;
import com.classvault.api.dto.ProjectDto;
import com.classvault.api.entity.enums.FileType;
import com.classvault.api.security.UserPrincipal;
import com.classvault.api.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getProjects(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer semester,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ProjectDto> projects = projectService.getPublicProjects(query, category, semester, pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/my-projects")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getMyProjects(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ProjectDto> projects = projectService.getStudentProjects(currentUser.getId(), currentUser);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectDto project = projectService.getProjectById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(project));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(
            @Valid @RequestBody ProjectDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectDto created = projectService.createProject(dto, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Project created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectDto updated = projectService.updateProject(id, dto, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", updated));
    }

    @PostMapping("/{id}/files")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProjectDto>> uploadProjectFile(
            @PathVariable Long id,
            @RequestParam("fileType") FileType fileType,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        ProjectDto updated = projectService.uploadProjectFile(id, fileType, file, currentUser);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", updated));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> incrementViewCounter(@PathVariable Long id) {
        projectService.incrementViews(id);
        return ResponseEntity.ok(ApiResponse.success("View counted", null));
    }

    @PostMapping("/{id}/download/{fileId}")
    public ResponseEntity<ApiResponse<Void>> incrementDownloadCounter(@PathVariable Long id, @PathVariable Long fileId) {
        projectService.incrementDownloads(id);
        return ResponseEntity.ok(ApiResponse.success("Download counted", null));
    }

    @PostMapping("/{id}/like")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleLike(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean liked = projectService.toggleLike(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(Map.of("liked", liked)));
    }

    @PostMapping("/{id}/comments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CommentDto>> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String content = payload.get("content");
        CommentDto comment = projectService.addComment(id, content, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Comment added", comment));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", null));
    }
}
