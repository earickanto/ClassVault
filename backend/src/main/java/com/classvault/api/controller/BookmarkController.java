package com.classvault.api.controller;

import com.classvault.api.dto.ApiResponse;
import com.classvault.api.dto.ProjectDto;
import com.classvault.api.entity.Bookmark;
import com.classvault.api.repository.BookmarkRepository;
import com.classvault.api.security.UserPrincipal;
import com.classvault.api.service.ProjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/bookmarks")
public class BookmarkController {

    private final BookmarkRepository bookmarkRepository;
    private final ProjectService projectService;

    public BookmarkController(BookmarkRepository bookmarkRepository, ProjectService projectService) {
        this.bookmarkRepository = bookmarkRepository;
        this.projectService = projectService;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getBookmarkedProjects(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ProjectDto> projectDtos = projectService.getBookmarkedProjects(currentUser);
        return ResponseEntity.ok(ApiResponse.success(projectDtos));
    }

    @PostMapping("/toggle/{projectId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleBookmark(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        boolean bookmarked = projectService.toggleBookmark(projectId, currentUser);
        return ResponseEntity.ok(ApiResponse.success(Map.of("bookmarked", bookmarked)));
    }
}
