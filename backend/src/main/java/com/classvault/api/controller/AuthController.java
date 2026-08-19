package com.classvault.api.controller;

import com.classvault.api.dto.ApiResponse;
import com.classvault.api.dto.ChangePasswordRequest;
import com.classvault.api.dto.JwtAuthResponse;
import com.classvault.api.dto.LoginRequest;
import com.classvault.api.dto.RefreshTokenRequest;
import com.classvault.api.security.UserPrincipal;
import com.classvault.api.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        String clientIp = request.getRemoteAddr();
        JwtAuthResponse authResponse = authService.login(loginRequest, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", authResponse));
    }

    @PostMapping("/change-password")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ChangePasswordRequest changeRequest) {
        authService.changePassword(currentUser.getId(), changeRequest);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest) {
        JwtAuthResponse authResponse = authService.refreshToken(refreshRequest);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authResponse));
    }

    @PostMapping("/activate")
    public ResponseEntity<ApiResponse<JwtAuthResponse>> activateAccount(@Valid @RequestBody com.classvault.api.dto.ActivateAccountRequest activateRequest) {
        JwtAuthResponse authResponse = authService.activateAccount(activateRequest);
        return ResponseEntity.ok(ApiResponse.success("Account activated successfully", authResponse));
    }
}
