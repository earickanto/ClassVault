package com.classvault.api;

import com.classvault.api.dto.ChangePasswordRequest;
import com.classvault.api.dto.JwtAuthResponse;
import com.classvault.api.dto.LoginRequest;
import com.classvault.api.dto.ProjectDto;
import com.classvault.api.dto.StudentDto;
import com.classvault.api.entity.Student;
import com.classvault.api.entity.enums.Visibility;
import com.classvault.api.exception.BadCredentialsApiException;
import com.classvault.api.repository.ProjectRepository;
import com.classvault.api.repository.StudentRepository;
import com.classvault.api.security.UserPrincipal;
import com.classvault.api.service.AdminService;
import com.classvault.api.service.AdminService.CsvImportResult;
import com.classvault.api.service.AuthService;
import com.classvault.api.service.LeaderboardService;
import com.classvault.api.service.ProjectService;
import com.classvault.api.service.StudentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class FullClassImportAndSecurityTest {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AuthService authService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private LeaderboardService leaderboardService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("1. Full Class CSV Import with exact standard schema (name,register_number,roll_number,department,year,section)")
    void testFullClassCsvImport() {
        String csvContent = "name,register_number,roll_number,department,year,section\n" +
                "Kavya Ramesh,REG2026010,26AI010,Artificial Intelligence & Data Science,2,A\n" +
                "Rohan Sharma,REG2026011,26AI011,Artificial Intelligence & Data Science,2,A\n" +
                "Priya Natarajan,REG2026012,26AI012,Artificial Intelligence & Data Science,2,B\n" +
                "Arun Kumar,REG2026013,26AI013,Computer Science & Engineering,3,A\n";

        MockMultipartFile csvFile = new MockMultipartFile(
                "file", "full_class.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8)
        );

        CsvImportResult result = adminService.bulkImportStudents(csvFile);

        assertNotNull(result);
        assertEquals(4, result.getTotalRows());
        assertEquals(4, result.getImportedCount());
        assertEquals(0, result.getDuplicateCount());
        assertEquals(0, result.getInvalidCount());
        assertEquals(0, result.getFailedCount());

        Student kavya = studentRepository.findByRegisterNumber("REG2026010").orElse(null);
        assertNotNull(kavya);
        assertEquals("Kavya Ramesh", kavya.getName());
        assertEquals("26AI010", kavya.getRollNumber());
        assertEquals("Artificial Intelligence & Data Science", kavya.getDepartment());
        assertEquals(2, kavya.getYear());
        assertEquals("A", kavya.getSection());
        assertTrue(kavya.getFirstLogin());
        assertTrue(kavya.getAccountEnabled());
        assertTrue(passwordEncoder.matches("ClassVault@123", kavya.getPasswordHash()));
    }

    @Test
    @DisplayName("2. Pre-import Validation & Duplicate Detection (DB duplicate + in-batch duplicate + invalid rows)")
    void testDuplicateAndInvalidHandling() {
        String csvContent = "name,register_number,roll_number,department,year,section\n" +
                "Valid Student One,REG2026020,26CS020,Computer Science & Engineering,2,A\n" +
                "Duplicate Existing DB Reg,REG2021001,26CS021,Computer Science & Engineering,2,A\n" +
                "Duplicate Existing DB Roll,REG2026022,21CS001,Computer Science & Engineering,2,A\n" +
                "In-Batch Duplicate Reg,REG2026020,26CS023,Computer Science & Engineering,2,A\n" +
                "Missing Roll Number,REG2026024,,Computer Science & Engineering,2,A\n" +
                "Invalid Year,REG2026025,26CS025,Computer Science & Engineering,99,A\n" +
                "Missing Name,,26CS026,Computer Science & Engineering,2,A\n";

        MockMultipartFile csvFile = new MockMultipartFile(
                "file", "duplicates_test.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8)
        );

        CsvImportResult result = adminService.bulkImportStudents(csvFile);

        assertNotNull(result);
        assertEquals(7, result.getTotalRows());
        assertEquals(1, result.getImportedCount(), "Only 1 valid row should be imported");
        assertEquals(3, result.getDuplicateCount(), "3 duplicate rows should be detected");
        assertEquals(3, result.getInvalidCount(), "3 invalid format rows should be skipped");
        assertEquals(6, result.getErrors().size());
    }

    @Test
    @DisplayName("3. Student Authentication with Registration Number & First Login Password Change Flow")
    void testStudentLoginAndForcedPasswordChange() {
        // 1. Import Student
        String csv = "name,register_number,roll_number,department,year,section\n" +
                "Suresh Raina,REG2026030,26AI030,AI & DS,2,A\n";
        adminService.bulkImportStudents(new MockMultipartFile("file", "suresh.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8)));

        // 2. Student Login with Registration Number + Temporary Password
        LoginRequest loginReq = new LoginRequest("REG2026030", "ClassVault@123");
        JwtAuthResponse authResp = authService.login(loginReq, "127.0.0.1");

        assertNotNull(authResp);
        assertNotNull(authResp.getAccessToken());
        assertEquals("Suresh Raina", authResp.getName());
        assertEquals("REG2026030", authResp.getRegisterNumber());
        assertEquals("26AI030", authResp.getRollNumber());
        assertTrue(authResp.getFirstLogin());

        // 3. Force Password Change
        ChangePasswordRequest changeReq = new ChangePasswordRequest("ClassVault@123", "SureshNewSecret@2026");
        authService.changePassword(authResp.getId(), changeReq);

        // 4. Verify old temporary password fails
        assertThrows(BadCredentialsApiException.class, () -> {
            authService.login(new LoginRequest("REG2026030", "ClassVault@123"), "127.0.0.1");
        });

        // 5. Verify new password succeeds and firstLogin is false
        JwtAuthResponse newLoginResp = authService.login(new LoginRequest("REG2026030", "SureshNewSecret@2026"), "127.0.0.1");
        assertNotNull(newLoginResp.getAccessToken());
        assertFalse(newLoginResp.getFirstLogin());
    }

    @Test
    @DisplayName("4. Account Disable and Re-enable verification")
    void testAccountDisableAndEnable() {
        String csv = "name,register_number,roll_number,department,year,section\n" +
                "Vikram Seth,REG2026040,26CS040,CSE,3,A\n";
        adminService.bulkImportStudents(new MockMultipartFile("file", "vikram.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8)));

        Student student = studentRepository.findByRegisterNumber("REG2026040").orElseThrow();

        // Disable account
        adminService.setStudentStatus(student.getId(), false);

        // Login should be blocked
        assertThrows(BadCredentialsApiException.class, () -> {
            authService.login(new LoginRequest("REG2026040", "ClassVault@123"), "127.0.0.1");
        });

        // Enable account
        adminService.setStudentStatus(student.getId(), true);

        // Login succeeds again
        JwtAuthResponse login = authService.login(new LoginRequest("REG2026040", "ClassVault@123"), "127.0.0.1");
        assertNotNull(login.getAccessToken());
    }

    @Test
    @DisplayName("5. Profile Completion Score Calculation and Official Identity Read-Only Protection")
    void testProfileCompletionAndProtection() {
        String csv = "name,register_number,roll_number,department,year,section\n" +
                "Meera Patel,REG2026050,26IT050,Information Technology,2,B\n";
        adminService.bulkImportStudents(new MockMultipartFile("file", "meera.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8)));
        Student student = studentRepository.findByRegisterNumber("REG2026050").orElseThrow();

        // Initial completion score is base 40%
        int initialScore = studentService.calculateCompletionPercentage(student);
        assertEquals(40, initialScore);

        // Attempting to modify official fields via Student update is ignored
        StudentDto updateDto = StudentDto.builder()
                .name("Hacked Name")
                .registerNumber("HACKED_REG")
                .bio("Passionate cloud & DevOps developer")
                .skills("Docker, Kubernetes, AWS, Go")
                .githubUrl("https://github.com/meera")
                .linkedinUrl("https://linkedin.com/in/meera")
                .leetcodeUrl("https://leetcode.com/meera")
                .portfolioUrl("https://meera.dev")
                .build();

        StudentDto updated = studentService.updateStudentProfile(student.getId(), updateDto);

        // Official fields must remain unchanged
        assertEquals("Meera Patel", updated.getName());
        assertEquals("REG2026050", updated.getRegisterNumber());
        assertEquals("26IT050", updated.getRollNumber());

        // Self-managed fields updated
        assertEquals("Passionate cloud & DevOps developer", updated.getBio());
        assertTrue(updated.getSkills().contains("Docker"));

        // Score increases with bio, skills, and social links
        int updatedScore = updated.getCompletionPercentage();
        assertTrue(updatedScore >= 80, "Score should be >= 80% after adding bio, skills, and developer links");
    }

    @Test
    @DisplayName("6. Project Privacy & Ownership Enforcement (PRIVATE vs PUBLIC)")
    void testProjectPrivacyEnforcement() {
        Student owner = studentRepository.findByRegisterNumber("REG2021001").orElseThrow();
        Student otherStudent = studentRepository.findByRegisterNumber("REG2021002").orElseThrow();

        UserPrincipal ownerPrincipal = UserPrincipal.create(owner);
        UserPrincipal otherPrincipal = UserPrincipal.create(otherStudent);

        // Create Private Project
        ProjectDto newProject = ProjectDto.builder()
                .title("ClassVault Core Sharding System")
                .description("Internal proprietary sharding logic")
                .technologyUsed("Java, Spring Boot, PostgreSQL")
                .category("Systems & Cloud")
                .visibility(Visibility.PRIVATE)
                .build();

        ProjectDto created = projectService.createProject(newProject, ownerPrincipal);
        assertNotNull(created.getId());

        // Owner can access private project
        ProjectDto ownerView = projectService.getProjectById(created.getId(), ownerPrincipal);
        assertNotNull(ownerView);

        // Other student CANNOT access private project
        assertThrows(AccessDeniedException.class, () -> {
            projectService.getProjectById(created.getId(), otherPrincipal);
        });

        // Other student does not see private project in student list
        List<ProjectDto> studentList = projectService.getStudentProjects(owner.getId(), otherPrincipal);
        boolean containsPrivate = studentList.stream().anyMatch(p -> p.getId().equals(created.getId()));
        assertFalse(containsPrivate, "Private projects must not appear in other student's project list");
    }

    @Test
    @DisplayName("7. Admin Student Directory Filtering by Department, Year, and Section")
    void testAdminStudentFiltering() {
        String csv = "name,register_number,roll_number,department,year,section\n" +
                "Student AI 1,REG2026061,26AI061,Artificial Intelligence,2,A\n" +
                "Student AI 2,REG2026062,26AI062,Artificial Intelligence,2,B\n" +
                "Student CSE 1,REG2026063,26CS063,Computer Science,3,A\n";
        adminService.bulkImportStudents(new MockMultipartFile("file", "filter_test.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8)));

        Page<StudentDto> aiSecAPage = adminService.getStudents(null, "Artificial Intelligence", 2, "A", PageRequest.of(0, 10));
        assertTrue(aiSecAPage.getContent().stream().allMatch(s -> s.getDepartment().equalsIgnoreCase("Artificial Intelligence") && s.getYear() == 2 && s.getSection().equalsIgnoreCase("A")));
    }

    @Test
    @DisplayName("8. Leaderboard Score and Percentile Calculation")
    void testLeaderboardCalculations() {
        List<LeaderboardService.LeaderboardEntry> leaderboard = leaderboardService.getLeaderboard();
        assertNotNull(leaderboard);
        assertFalse(leaderboard.isEmpty());

        // Ranks must be sequential 1, 2, 3...
        for (int i = 0; i < leaderboard.size(); i++) {
            assertEquals(i + 1, leaderboard.get(i).getRank());
            assertTrue(leaderboard.get(i).getPercentile() >= 0 && leaderboard.get(i).getPercentile() <= 100);
        }
    }
}
