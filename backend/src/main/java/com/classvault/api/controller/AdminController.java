package com.classvault.api.controller;

import com.classvault.api.dto.ApiResponse;
import com.classvault.api.dto.CreateStudentRequest;
import com.classvault.api.dto.DatabaseDiagnosticDto;
import com.classvault.api.dto.ProjectDto;
import com.classvault.api.dto.StudentDto;
import com.classvault.api.entity.Announcement;
import com.classvault.api.entity.Student;
import com.classvault.api.entity.enums.ProjectStatus;
import com.classvault.api.entity.enums.Visibility;
import com.classvault.api.security.UserPrincipal;
import com.classvault.api.service.AdminService;
import com.classvault.api.service.AdminService.AdminDashboardData;
import com.classvault.api.service.AdminService.CsvImportResult;
import com.classvault.api.service.AdminService.CsvPreviewResult;
import com.classvault.api.service.AdminService.CsvRowData;
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
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardData>> getDashboardData() {
        AdminDashboardData data = adminService.getDashboardData();
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<Page<StudentDto>>> getStudents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String section,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<StudentDto> students = adminService.getStudents(query, department, year, section, pageable);
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> getStudentById(@PathVariable Long id) {
        StudentDto student = adminService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success(student));
    }

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<StudentDto>> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        StudentDto created = adminService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student account created successfully", created));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody CreateStudentRequest request) {
        StudentDto updated = adminService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", updated));
    }

    @PutMapping("/students/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleStudentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload) {
        boolean enabled = payload.getOrDefault("enabled", true);
        adminService.toggleStudentStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.success(enabled ? "Account enabled" : "Account disabled", null));
    }

    @PutMapping("/students/{id}/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetStudentPassword(@PathVariable Long id) {
        adminService.resetStudentPassword(id);
        return ResponseEntity.ok(ApiResponse.success("Password reset to default (ClassVault@123) successfully", null));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        adminService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student account deleted successfully", null));
    }

    @GetMapping("/students/{id}/projects")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getStudentProjects(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ProjectDto> projects = adminService.getStudentProjects(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @PostMapping("/students/csv/preview")
    public ResponseEntity<ApiResponse<CsvPreviewResult>> previewCsvImport(@RequestParam("file") MultipartFile file) {
        CsvPreviewResult preview = adminService.previewBulkImportStudents(file);
        return ResponseEntity.ok(ApiResponse.success("CSV preview and validation complete", preview));
    }

    @PostMapping("/students/csv/confirm")
    public ResponseEntity<ApiResponse<CsvImportResult>> confirmCsvImport(@RequestBody List<CsvRowData> validRows) {
        CsvImportResult result = adminService.confirmBulkImportStudents(validRows);
        return ResponseEntity.ok(ApiResponse.success("CSV students imported successfully", result));
    }

    @PostMapping({"/students/csv", "/students/import"})
    public ResponseEntity<ApiResponse<CsvImportResult>> bulkImportStudents(@RequestParam("file") MultipartFile file) {
        CsvImportResult result = adminService.bulkImportStudents(file);
        return ResponseEntity.ok(ApiResponse.success("CSV import processed", result));
    }

    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<Page<ProjectDto>>> getAdminProjects(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Visibility visibility,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<ProjectDto> projects = adminService.getAdminProjects(query, status, visibility, pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    @PutMapping("/projects/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateProjectStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String statusStr = payload.get("status");
        String reason = payload.get("reason");

        ProjectStatus status = ProjectStatus.valueOf(statusStr);
        adminService.updateProjectStatus(id, status, reason);

        return ResponseEntity.ok(ApiResponse.success("Project status updated to " + status, null));
    }

    @PutMapping("/projects/{id}/feature")
    public ResponseEntity<ApiResponse<Void>> toggleFeaturedProject(@PathVariable Long id) {
        adminService.toggleFeaturedProject(id);
        return ResponseEntity.ok(ApiResponse.success("Featured status updated", null));
    }

    @PutMapping("/projects/{id}/visibility")
    public ResponseEntity<ApiResponse<Void>> updateProjectVisibility(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        String visStr = payload.get("visibility");
        Visibility visibility = Visibility.valueOf(visStr);
        adminService.updateProjectVisibility(id, visibility);
        return ResponseEntity.ok(ApiResponse.success("Visibility updated to " + visibility, null));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        adminService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", null));
    }

    @PostMapping("/announcements")
    public ResponseEntity<ApiResponse<Announcement>> createAnnouncement(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String body = payload.get("body");

        Announcement announcement = adminService.createAnnouncement(currentUser.getId(), title, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Announcement broadcasted", announcement));
    }

    @PostMapping("/badges/award")
    public ResponseEntity<ApiResponse<Void>> awardBadge(@RequestBody Map<String, Long> payload) {
        Long studentId = payload.get("studentId");
        Long badgeId = payload.get("badgeId");

        adminService.awardBadge(studentId, badgeId);
        return ResponseEntity.ok(ApiResponse.success("Badge awarded successfully", null));
    }

    @GetMapping("/diagnostics/database")
    public ResponseEntity<ApiResponse<DatabaseDiagnosticDto>> getDatabaseDiagnostics() {
        DatabaseDiagnosticDto diagnostic = adminService.getDatabaseDiagnostics();
        return ResponseEntity.ok(ApiResponse.success("Database diagnostics retrieved", diagnostic));
    }
}
