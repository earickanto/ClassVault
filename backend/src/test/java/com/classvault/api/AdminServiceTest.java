package com.classvault.api;

import com.classvault.api.dto.CreateStudentRequest;
import com.classvault.api.dto.StudentDto;
import com.classvault.api.entity.Student;
import com.classvault.api.entity.enums.ProjectStatus;
import com.classvault.api.repository.ProjectRepository;
import com.classvault.api.repository.StudentRepository;
import com.classvault.api.service.AdminService;
import com.classvault.api.service.AdminService.AdminDashboardData;
import com.classvault.api.service.AdminService.CsvImportResult;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AdminServiceTest {

    @Autowired
    private AdminService adminService;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    @DisplayName("Admin can create a single student with unique credentials")
    void testCreateStudentSuccess() {
        CreateStudentRequest req = new CreateStudentRequest(
                "Michael Scott", "21CS099", "REG2021099", "Computer Science",
                3, "B", "michael.scott@classvault.edu", "Password@123"
        );

        StudentDto student = adminService.createStudent(req);
        assertNotNull(student.getId());
        assertEquals("Michael Scott", student.getName());
        assertEquals("21CS099", student.getRollNumber());
        assertTrue(student.getAccountEnabled());
    }

    @Test
    @DisplayName("Duplicate roll number or email creation must be rejected")
    void testCreateDuplicateStudentRejected() {
        CreateStudentRequest duplicate = new CreateStudentRequest(
                "Duplicate John", "21CS001", "REG_NEW_001", "Computer Science",
                3, "A", "new_email@classvault.edu", "Password@123"
        );

        assertThrows(IllegalArgumentException.class, () -> {
            adminService.createStudent(duplicate);
        });
    }

    @Test
    @DisplayName("Admin can toggle student enabled/disabled status")
    void testToggleStudentStatus() {
        Student john = studentRepository.findByRollNumber("21CS001").orElseThrow();
        assertTrue(john.getAccountEnabled());

        adminService.setStudentStatus(john.getId(), false);
        Student updated = studentRepository.findById(john.getId()).orElseThrow();
        assertFalse(updated.getAccountEnabled());

        adminService.setStudentStatus(john.getId(), true);
        Student reEnabled = studentRepository.findById(john.getId()).orElseThrow();
        assertTrue(reEnabled.getAccountEnabled());
    }

    @Test
    @DisplayName("Admin can reset student password")
    void testResetStudentPassword() {
        Student john = studentRepository.findByRollNumber("21CS001").orElseThrow();
        adminService.resetStudentPassword(john.getId(), "BrandNewPassword@999");
        Student updated = studentRepository.findById(john.getId()).orElseThrow();
        assertNotNull(updated.getPasswordHash());
    }

    @Test
    @DisplayName("Admin dashboard data aggregates metrics dynamically")
    void testAdminDashboardData() {
        AdminDashboardData data = adminService.getDashboardData();

        assertNotNull(data);
        assertTrue(data.getTotalStudents() > 0);
        assertTrue(data.getTotalProjects() > 0);
        assertNotNull(data.getStorageUsed());
        assertNotNull(data.getMonthlyProjects());
        assertNotNull(data.getTechDistribution());
    }

    @Test
    @DisplayName("Preview CSV import identifies valid and error rows without persisting")
    void testPreviewCsvImport() {
        String csvContent = "name,register_number,roll_number,department,year,section\n" +
                "New Student 1,REG2021101,21CS101,Computer Science,3,A\n" +
                "New Student 2,REG2021102,21CS102,Computer Science,3,B\n" +
                ",REG2021103,21CS103,Computer Science,3,A\n" + // Missing name
                "Duplicate Student,REG2021001,21CS001,Computer Science,3,A\n"; // Duplicate roll/reg

        MockMultipartFile csvFile = new MockMultipartFile(
                "file", "students.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8)
        );

        AdminService.CsvPreviewResult preview = adminService.previewBulkImportStudents(csvFile);

        assertNotNull(preview);
        assertEquals(2, preview.getValidCount(), "Should find 2 valid rows");
        assertEquals(2, preview.getErrors().size(), "Should find 2 error rows");
    }

    @Test
    @DisplayName("Bulk CSV import parses rows and skips invalid/duplicate entries with error reporting")
    void testBulkCsvImport() {
        String csvContent = "name,register_number,roll_number,department,year,section\n" +
                "New Student 1,REG2021201,21CS201,Computer Science,3,A\n" +
                "New Student 2,REG2021202,21CS202,Computer Science,3,B\n" +
                ",REG2021203,21CS203,Computer Science,3,A\n" + // Missing name
                "Duplicate Student,REG2021001,21CS001,Computer Science,3,A\n"; // Duplicate roll

        MockMultipartFile csvFile = new MockMultipartFile(
                "file", "students.csv", "text/csv", csvContent.getBytes(StandardCharsets.UTF_8)
        );

        CsvImportResult result = adminService.bulkImportStudents(csvFile);

        assertNotNull(result);
        assertEquals(2, result.getImportedCount(), "Should import 2 valid rows");
        assertEquals(2, result.getErrors().size(), "Should report 2 invalid rows");
    }
}
