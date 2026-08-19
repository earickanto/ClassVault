package com.classvault.api.service;

import com.classvault.api.dto.ChangePasswordRequest;
import com.classvault.api.dto.JwtAuthResponse;
import com.classvault.api.dto.LoginRequest;
import com.classvault.api.dto.RefreshTokenRequest;
import com.classvault.api.entity.Admin;
import com.classvault.api.entity.RefreshToken;
import com.classvault.api.entity.Student;
import com.classvault.api.exception.BadCredentialsApiException;
import com.classvault.api.exception.ResourceNotFoundException;
import com.classvault.api.repository.AdminRepository;
import com.classvault.api.repository.RefreshTokenRepository;
import com.classvault.api.repository.StudentRepository;
import com.classvault.api.security.JwtTokenProvider;
import com.classvault.api.security.RateLimitingService;
import com.classvault.api.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimitingService rateLimitingService;

    @Value("${application.security.jwt.refresh-token-expiration-ms:604800000}")
    private long refreshTokenExpirationMs;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider tokenProvider,
                       StudentRepository studentRepository, AdminRepository adminRepository,
                       RefreshTokenRepository refreshTokenRepository, PasswordEncoder passwordEncoder,
                       RateLimitingService rateLimitingService) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.rateLimitingService = rateLimitingService;
    }

    @Transactional
    public JwtAuthResponse login(LoginRequest request, String clientIp) {
        if (rateLimitingService.isRateLimited(clientIp)) {
            throw new BadCredentialsApiException("Access Denied: Too many failed login attempts. Please try again later.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            rateLimitingService.loginSucceeded(clientIp);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = createRefreshToken(userPrincipal.getEmail() != null ? userPrincipal.getEmail() : userPrincipal.getUsername());

            return JwtAuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .id(userPrincipal.getId())
                    .name(userPrincipal.getName())
                    .email(userPrincipal.getEmail())
                    .role(userPrincipal.getRole())
                    .rollNumber(userPrincipal.getRollNumber())
                    .registerNumber(userPrincipal.getRegisterNumber())
                    .profilePhotoUrl(userPrincipal.getProfilePhotoUrl())
                    .firstLogin(userPrincipal.isFirstLogin())
                    .build();

        } catch (Exception ex) {
            org.slf4j.LoggerFactory.getLogger(AuthService.class).error("Authentication failed for user {}: {}", request.getUsername(), ex.getMessage(), ex);
            rateLimitingService.loginFailed(clientIp);
            throw new BadCredentialsApiException("Access Denied: Invalid credentials or unknown account");
        }
    }

    @Transactional
    public void changePassword(Long studentId, ChangePasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        if (Boolean.FALSE.equals(student.getFirstLogin()) && request.getOldPassword() != null) {
            if (!passwordEncoder.matches(request.getOldPassword(), student.getPasswordHash())) {
                throw new BadCredentialsApiException("Current password does not match");
            }
        }

        student.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        student.setFirstLogin(false);
        studentRepository.save(student);

        if (student.getEmail() != null) {
            refreshTokenRepository.deleteByUserEmail(student.getEmail());
        }
    }

    @Transactional
    public String createRefreshToken(String email) {
        refreshTokenRepository.deleteByUserEmail(email);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .userEmail(email)
                .expiryDate(LocalDateTime.now().plusNanos(refreshTokenExpirationMs * 1_000_000L))
                .build();

        refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    @Transactional
    public JwtAuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadCredentialsApiException("Access Denied: Invalid refresh token"));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new BadCredentialsApiException("Access Denied: Refresh token has expired. Please log in again.");
        }

        String email = token.getUserEmail();
        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);

        String role = adminOpt.isPresent() ? "ROLE_ADMIN" : "ROLE_STUDENT";
        String accessToken = tokenProvider.generateTokenFromEmail(email, role);

        Long id = studentOpt.map(Student::getId).orElseGet(() -> adminOpt.map(Admin::getId).orElse(0L));
        String name = studentOpt.map(Student::getName).orElseGet(() -> adminOpt.map(Admin::getName).orElse("User"));
        String rollNumber = studentOpt.map(Student::getRollNumber).orElse(null);
        String registerNumber = studentOpt.map(Student::getRegisterNumber).orElse(null);
        String photoUrl = studentOpt.map(Student::getProfilePhotoUrl).orElse(null);
        Boolean firstLogin = studentOpt.map(Student::getFirstLogin).orElse(false);

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(token.getToken())
                .tokenType("Bearer")
                .id(id)
                .name(name)
                .email(email)
                .role(role)
                .rollNumber(rollNumber)
                .registerNumber(registerNumber)
                .profilePhotoUrl(photoUrl)
                .firstLogin(firstLogin)
                .build();
    }

    @Transactional
    public JwtAuthResponse activateAccount(com.classvault.api.dto.ActivateAccountRequest request) {
        Student student = studentRepository.findByIdentifier(request.getIdentifier().trim())
                .orElseThrow(() -> new BadCredentialsApiException(
                        "Access Denied: Student ID " + request.getIdentifier() + " is not authorized. Please contact the administrator."));

        if (!student.getEmail().trim().equalsIgnoreCase(request.getEmail().trim())) {
            throw new BadCredentialsApiException("Access Denied: Email address does not match the authorized record for this student ID.");
        }

        student.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        student.setAccountEnabled(true);
        student.setFirstLogin(false);
        Student updated = studentRepository.save(student);

        String accessToken = tokenProvider.generateTokenFromEmail(updated.getEmail(), "ROLE_STUDENT");
        String refreshToken = createRefreshToken(updated.getEmail());

        return JwtAuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .id(updated.getId())
                .name(updated.getName())
                .email(updated.getEmail())
                .role("ROLE_STUDENT")
                .rollNumber(updated.getRollNumber())
                .registerNumber(updated.getRegisterNumber())
                .profilePhotoUrl(updated.getProfilePhotoUrl())
                .firstLogin(false)
                .build();
    }
}
