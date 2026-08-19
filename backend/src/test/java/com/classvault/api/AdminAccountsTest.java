package com.classvault.api;

import com.classvault.api.dto.JwtAuthResponse;
import com.classvault.api.dto.LoginRequest;
import com.classvault.api.dto.StudentDto;
import com.classvault.api.entity.Admin;
import com.classvault.api.exception.BadCredentialsApiException;
import com.classvault.api.repository.AdminRepository;
import com.classvault.api.service.AdminService;
import com.classvault.api.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AdminAccountsTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private AdminService adminService;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("1. Verify all 4 admin accounts exist with valid BCrypt hashes and ROLE_ADMIN")
    void testAdminAccountsAuthentication() {
        // Test Admin 1
        LoginRequest req1 = new LoginRequest("admin1@classvault.edu", "Admin@123");
        JwtAuthResponse resp1 = authService.login(req1, "127.0.0.1");
        assertNotNull(resp1);
        assertNotNull(resp1.getAccessToken());
        assertEquals("ROLE_ADMIN", resp1.getRole());
        assertEquals("admin1@classvault.edu", resp1.getEmail());

        // Test Admin 2
        LoginRequest req2 = new LoginRequest("admin2@classvault.edu", "Admin@456");
        JwtAuthResponse resp2 = authService.login(req2, "127.0.0.1");
        assertNotNull(resp2);
        assertNotNull(resp2.getAccessToken());
        assertEquals("ROLE_ADMIN", resp2.getRole());
        assertEquals("admin2@classvault.edu", resp2.getEmail());

        // Test Admin 3
        LoginRequest req3 = new LoginRequest("admin3@classvault.edu", "Admin@789");
        JwtAuthResponse resp3 = authService.login(req3, "127.0.0.1");
        assertNotNull(resp3);
        assertNotNull(resp3.getAccessToken());
        assertEquals("ROLE_ADMIN", resp3.getRole());
        assertEquals("admin3@classvault.edu", resp3.getEmail());

        // Test Existing Admin
        LoginRequest reqOrig = new LoginRequest("admin@classvault.edu", "Admin@123");
        JwtAuthResponse respOrig = authService.login(reqOrig, "127.0.0.1");
        assertNotNull(respOrig);
        assertNotNull(respOrig.getAccessToken());
        assertEquals("ROLE_ADMIN", respOrig.getRole());
        assertEquals("admin@classvault.edu", respOrig.getEmail());
    }

    @Test
    @DisplayName("2. Verify invalid password rejection for administrator accounts")
    void testAdminInvalidPassword() {
        assertThrows(BadCredentialsApiException.class, () -> {
            authService.login(new LoginRequest("admin1@classvault.edu", "WrongPassword!"), "127.0.0.1");
        });
        assertThrows(BadCredentialsApiException.class, () -> {
            authService.login(new LoginRequest("admin2@classvault.edu", "Admin@123"), "127.0.0.1");
        });
        assertThrows(BadCredentialsApiException.class, () -> {
            authService.login(new LoginRequest("admin3@classvault.edu", "Admin@123"), "127.0.0.1");
        });
    }

    @Test
    @DisplayName("3. Verify BCrypt password hashing in database")
    void testPasswordHashingInDatabase() {
        Optional<Admin> a1 = adminRepository.findByEmailIgnoreCase("admin1@classvault.edu");
        assertTrue(a1.isPresent());
        assertTrue(a1.get().getPasswordHash().startsWith("$2a$") || a1.get().getPasswordHash().startsWith("$2b$"));
        assertTrue(passwordEncoder.matches("Admin@123", a1.get().getPasswordHash()));

        Optional<Admin> a2 = adminRepository.findByEmailIgnoreCase("admin2@classvault.edu");
        assertTrue(a2.isPresent());
        assertTrue(passwordEncoder.matches("Admin@456", a2.get().getPasswordHash()));

        Optional<Admin> a3 = adminRepository.findByEmailIgnoreCase("admin3@classvault.edu");
        assertTrue(a3.isPresent());
        assertTrue(passwordEncoder.matches("Admin@789", a3.get().getPasswordHash()));
    }
}
