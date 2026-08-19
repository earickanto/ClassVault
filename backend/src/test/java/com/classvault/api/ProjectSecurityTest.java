package com.classvault.api;

import com.classvault.api.dto.ProjectDto;
import com.classvault.api.entity.Student;
import com.classvault.api.entity.enums.ProjectStatus;
import com.classvault.api.entity.enums.Visibility;
import com.classvault.api.repository.ProjectRepository;
import com.classvault.api.repository.StudentRepository;
import com.classvault.api.security.UserPrincipal;
import com.classvault.api.service.ProjectService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProjectSecurityTest {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Test
    @DisplayName("Public projects can be viewed by any authenticated student")
    void testPublicProjectAccessAllowed() {
        Student john = studentRepository.findByRollNumber("21CS001").orElseThrow();
        Student jane = studentRepository.findByRollNumber("21CS002").orElseThrow();

        // John creates public project
        UserPrincipal johnPrincipal = UserPrincipal.create(john);
        ProjectDto input = ProjectDto.builder()
                .title("Public AI System")
                .description("A public repository")
                .technologyUsed("Python, PyTorch, React")
                .category("Machine Learning")
                .semester(6)
                .visibility(Visibility.PUBLIC)
                .status(ProjectStatus.APPROVED)
                .build();
        ProjectDto created = projectService.createProject(input, johnPrincipal);

        // Jane views John's public project
        UserPrincipal janePrincipal = UserPrincipal.create(jane);
        ProjectDto result = projectService.getProjectById(created.getId(), janePrincipal);

        assertNotNull(result);
        assertEquals("Public AI System", result.getTitle());
    }

    @Test
    @DisplayName("Private project can be viewed by its owner")
    void testPrivateProjectOwnerAccessAllowed() {
        Student john = studentRepository.findByRollNumber("21CS001").orElseThrow();
        UserPrincipal johnPrincipal = UserPrincipal.create(john);

        ProjectDto input = ProjectDto.builder()
                .title("John's Secret Blockchain Repo")
                .description("Confidential thesis project")
                .technologyUsed("Go, Raft, Docker")
                .category("Systems & Cloud")
                .semester(7)
                .visibility(Visibility.PRIVATE)
                .status(ProjectStatus.APPROVED)
                .build();
        ProjectDto created = projectService.createProject(input, johnPrincipal);

        // John views own private project
        ProjectDto result = projectService.getProjectById(created.getId(), johnPrincipal);
        assertNotNull(result);
        assertEquals("John's Secret Blockchain Repo", result.getTitle());
    }

    @Test
    @DisplayName("Private project access by another student MUST be rejected at backend level")
    void testPrivateProjectUnauthorizedStudentAccessForbidden() {
        Student john = studentRepository.findByRollNumber("21CS001").orElseThrow();
        Student jane = studentRepository.findByRollNumber("21CS002").orElseThrow();

        UserPrincipal johnPrincipal = UserPrincipal.create(john);
        ProjectDto input = ProjectDto.builder()
                .title("John's Secret Private Project")
                .description("Private files only")
                .technologyUsed("C++, Arduino, MQTT")
                .category("IoT & Embedded")
                .semester(5)
                .visibility(Visibility.PRIVATE)
                .status(ProjectStatus.APPROVED)
                .build();
        ProjectDto created = projectService.createProject(input, johnPrincipal);

        // Jane attempts to access John's private project
        UserPrincipal janePrincipal = UserPrincipal.create(jane);
        assertThrows(AccessDeniedException.class, () -> {
            projectService.getProjectById(created.getId(), janePrincipal);
        });
    }

    @Test
    @DisplayName("Admin can view any student's private project")
    void testAdminCanAccessAnyPrivateProject() {
        Student john = studentRepository.findByRollNumber("21CS001").orElseThrow();
        UserPrincipal johnPrincipal = UserPrincipal.create(john);

        ProjectDto input = ProjectDto.builder()
                .title("John's Private Research")
                .description("Admin review required")
                .technologyUsed("React, TypeScript, Java")
                .category("Web Application")
                .semester(4)
                .visibility(Visibility.PRIVATE)
                .status(ProjectStatus.PENDING)
                .build();
        ProjectDto created = projectService.createProject(input, johnPrincipal);

        // Admin views John's private project
        UserPrincipal adminPrincipal = new UserPrincipal(
                1L, "Admin", "admin@classvault.edu", "pass", "ROLE_ADMIN", null, null, true,
                java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        ProjectDto result = projectService.getProjectById(created.getId(), adminPrincipal);
        assertNotNull(result);
        assertEquals("John's Private Research", result.getTitle());
    }
}
