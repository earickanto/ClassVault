package com.classvault.api.controller;

import com.classvault.api.dto.ApiResponse;
import com.classvault.api.dto.StudentDto;
import com.classvault.api.security.UserPrincipal;
import com.classvault.api.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping({"/me", "/profile"})
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDto>> getCurrentStudentProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        StudentDto profile = studentService.getStudentProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping({"/me", "/profile"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDto>> updateCurrentStudentProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody StudentDto updateDto) {
        StudentDto updated = studentService.updateStudentProfile(currentUser.getId(), updateDto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @PostMapping({"/me/photo", "/profile/photo"})
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentDto>> uploadProfilePhoto(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("file") MultipartFile file) {
        StudentDto updated = studentService.uploadProfilePhoto(currentUser.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Profile photo uploaded successfully", updated));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDto>> getStudentById(@PathVariable Long id) {
        StudentDto profile = studentService.getStudentProfile(id);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
