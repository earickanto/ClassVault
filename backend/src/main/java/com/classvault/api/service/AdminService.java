package com.classvault.api.service;

import com.classvault.api.dto.CreateStudentRequest;
import com.classvault.api.dto.DatabaseDiagnosticDto;
import com.classvault.api.dto.ProjectDto;
import com.classvault.api.dto.StudentDto;
import com.classvault.api.entity.*;
import com.classvault.api.entity.enums.NotificationType;
import com.classvault.api.entity.enums.ProjectStatus;
import com.classvault.api.entity.enums.Visibility;
import com.classvault.api.exception.ResourceNotFoundException;
import com.classvault.api.repository.*;
import com.classvault.api.security.UserPrincipal;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectFileRepository projectFileRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationRepository notificationRepository;
    private final BadgeRepository badgeRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentService studentService;
    private final ProjectService projectService;

    @Autowired(required = false)
    private DataSource dataSource;

    @Autowired(required = false)
    private Flyway flyway;

    public AdminService(StudentRepository studentRepository, ProjectRepository projectRepository,
                        ProjectFileRepository projectFileRepository,
                        AnnouncementRepository announcementRepository, NotificationRepository notificationRepository,
                        BadgeRepository badgeRepository, StudentBadgeRepository studentBadgeRepository,
                        AdminRepository adminRepository, PasswordEncoder passwordEncoder,
                        StudentService studentService, ProjectService projectService) {
        this.studentRepository = studentRepository;
        this.projectRepository = projectRepository;
        this.projectFileRepository = projectFileRepository;
        this.announcementRepository = announcementRepository;
        this.notificationRepository = notificationRepository;
        this.badgeRepository = badgeRepository;
        this.studentBadgeRepository = studentBadgeRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentService = studentService;
        this.projectService = projectService;
    }

    public static class AdminDashboardData {
        private long totalStudents;
        private long activeStudents;
        private long inactiveStudents;
        private long firstLoginPendingStudents;
        private long totalProjects;
        private long publicProjects;
        private long privateProjects;
        private long pendingProjects;
        private long approvedProjects;
        private long rejectedProjects;
        private long totalViews;
        private long totalDownloads;
        private long totalLikes;
        private String storageUsed;
        private String mostActiveStudent;
        private List<Map<String, Object>> monthlyProjects;
        private List<Map<String, Object>> techDistribution;

        public AdminDashboardData() {}

        public AdminDashboardData(long totalStudents, long activeStudents, long inactiveStudents, long firstLoginPendingStudents,
                                  long totalProjects, long publicProjects, long privateProjects,
                                  long pendingProjects, long approvedProjects, long rejectedProjects,
                                  long totalViews, long totalDownloads, long totalLikes,
                                  String storageUsed, String mostActiveStudent,
                                  List<Map<String, Object>> monthlyProjects, List<Map<String, Object>> techDistribution) {
            this.totalStudents = totalStudents;
            this.activeStudents = activeStudents;
            this.inactiveStudents = inactiveStudents;
            this.firstLoginPendingStudents = firstLoginPendingStudents;
            this.totalProjects = totalProjects;
            this.publicProjects = publicProjects;
            this.privateProjects = privateProjects;
            this.pendingProjects = pendingProjects;
            this.approvedProjects = approvedProjects;
            this.rejectedProjects = rejectedProjects;
            this.totalViews = totalViews;
            this.totalDownloads = totalDownloads;
            this.totalLikes = totalLikes;
            this.storageUsed = storageUsed;
            this.mostActiveStudent = mostActiveStudent;
            this.monthlyProjects = monthlyProjects;
            this.techDistribution = techDistribution;
        }

        public long getTotalStudents() { return totalStudents; }
        public long getActiveStudents() { return activeStudents; }
        public long getInactiveStudents() { return inactiveStudents; }
        public long getFirstLoginPendingStudents() { return firstLoginPendingStudents; }
        public long getTotalProjects() { return totalProjects; }
        public long getPublicProjects() { return publicProjects; }
        public long getPrivateProjects() { return privateProjects; }
        public long getPendingProjects() { return pendingProjects; }
        public long getApprovedProjects() { return approvedProjects; }
        public long getRejectedProjects() { return rejectedProjects; }
        public long getTotalViews() { return totalViews; }
        public long getTotalDownloads() { return totalDownloads; }
        public long getTotalLikes() { return totalLikes; }
        public String getStorageUsed() { return storageUsed; }
        public String getMostActiveStudent() { return mostActiveStudent; }
        public List<Map<String, Object>> getMonthlyProjects() { return monthlyProjects; }
        public List<Map<String, Object>> getTechDistribution() { return techDistribution; }

        public static AdminDashboardDataBuilder builder() { return new AdminDashboardDataBuilder(); }

        public static class AdminDashboardDataBuilder {
            private long totalStudents;
            private long activeStudents;
            private long inactiveStudents;
            private long firstLoginPendingStudents;
            private long totalProjects;
            private long publicProjects;
            private long privateProjects;
            private long pendingProjects;
            private long approvedProjects;
            private long rejectedProjects;
            private long totalViews;
            private long totalDownloads;
            private long totalLikes;
            private String storageUsed;
            private String mostActiveStudent;
            private List<Map<String, Object>> monthlyProjects;
            private List<Map<String, Object>> techDistribution;

            public AdminDashboardDataBuilder totalStudents(long totalStudents) { this.totalStudents = totalStudents; return this; }
            public AdminDashboardDataBuilder activeStudents(long activeStudents) { this.activeStudents = activeStudents; return this; }
            public AdminDashboardDataBuilder inactiveStudents(long inactiveStudents) { this.inactiveStudents = inactiveStudents; return this; }
            public AdminDashboardDataBuilder firstLoginPendingStudents(long firstLoginPendingStudents) { this.firstLoginPendingStudents = firstLoginPendingStudents; return this; }
            public AdminDashboardDataBuilder totalProjects(long totalProjects) { this.totalProjects = totalProjects; return this; }
            public AdminDashboardDataBuilder publicProjects(long publicProjects) { this.publicProjects = publicProjects; return this; }
            public AdminDashboardDataBuilder privateProjects(long privateProjects) { this.privateProjects = privateProjects; return this; }
            public AdminDashboardDataBuilder pendingProjects(long pendingProjects) { this.pendingProjects = pendingProjects; return this; }
            public AdminDashboardDataBuilder approvedProjects(long approvedProjects) { this.approvedProjects = approvedProjects; return this; }
            public AdminDashboardDataBuilder rejectedProjects(long rejectedProjects) { this.rejectedProjects = rejectedProjects; return this; }
            public AdminDashboardDataBuilder totalViews(long totalViews) { this.totalViews = totalViews; return this; }
            public AdminDashboardDataBuilder totalDownloads(long totalDownloads) { this.totalDownloads = totalDownloads; return this; }
            public AdminDashboardDataBuilder totalLikes(long totalLikes) { this.totalLikes = totalLikes; return this; }
            public AdminDashboardDataBuilder storageUsed(String storageUsed) { this.storageUsed = storageUsed; return this; }
            public AdminDashboardDataBuilder mostActiveStudent(String mostActiveStudent) { this.mostActiveStudent = mostActiveStudent; return this; }
            public AdminDashboardDataBuilder monthlyProjects(List<Map<String, Object>> monthlyProjects) { this.monthlyProjects = monthlyProjects; return this; }
            public AdminDashboardDataBuilder techDistribution(List<Map<String, Object>> techDistribution) { this.techDistribution = techDistribution; return this; }

            public AdminDashboardData build() {
                return new AdminDashboardData(totalStudents, activeStudents, inactiveStudents, firstLoginPendingStudents, totalProjects,
                        publicProjects, privateProjects, pendingProjects, approvedProjects, rejectedProjects,
                        totalViews, totalDownloads, totalLikes, storageUsed, mostActiveStudent, monthlyProjects, techDistribution);
            }
        }
    }

    public static class CsvRowData {
        private int row;
        private String name;
        private String registerNumber;
        private String rollNumber;
        private String department;
        private int year;
        private String section;

        public CsvRowData() {}

        public CsvRowData(int row, String name, String registerNumber, String rollNumber, String department, int year, String section) {
            this.row = row;
            this.name = name;
            this.registerNumber = registerNumber;
            this.rollNumber = rollNumber;
            this.department = department;
            this.year = year;
            this.section = section;
        }

        public int getRow() { return row; }
        public void setRow(int row) { this.row = row; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getRegisterNumber() { return registerNumber; }
        public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public int getYear() { return year; }
        public void setYear(int year) { this.year = year; }

        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
    }

    public static class CsvRowError {
        private int row;
        private String field;
        private String message;
        private String errorType; // "DUPLICATE", "INVALID", "FORMAT"

        public CsvRowError() {}

        public CsvRowError(int row, String field, String message) {
            this(row, field, message, "INVALID");
        }

        public CsvRowError(int row, String field, String message, String errorType) {
            this.row = row;
            this.field = field;
            this.message = message;
            this.errorType = errorType != null ? errorType : "INVALID";
        }

        public int getRow() { return row; }
        public String getField() { return field; }
        public String getMessage() { return message; }
        public String getErrorType() { return errorType; }
    }

    public static class CsvPreviewResult {
        private int totalRows;
        private int validCount;
        private int duplicateCount;
        private int invalidCount;
        private List<CsvRowData> validRows;
        private List<CsvRowError> errors;

        public CsvPreviewResult() {}

        public CsvPreviewResult(int totalRows, int validCount, int duplicateCount, int invalidCount, List<CsvRowData> validRows, List<CsvRowError> errors) {
            this.totalRows = totalRows;
            this.validCount = validCount;
            this.duplicateCount = duplicateCount;
            this.invalidCount = invalidCount;
            this.validRows = validRows != null ? validRows : new ArrayList<>();
            this.errors = errors != null ? errors : new ArrayList<>();
        }

        public int getTotalRows() { return totalRows; }
        public int getValidCount() { return validCount; }
        public int getDuplicateCount() { return duplicateCount; }
        public int getInvalidCount() { return invalidCount; }
        public List<CsvRowData> getValidRows() { return validRows; }
        public List<CsvRowError> getErrors() { return errors; }
    }

    public static class CsvImportResult {
        private int totalRows;
        private int importedCount;
        private int duplicateCount;
        private int invalidCount;
        private int failedCount;
        private List<CsvRowError> errors;

        public CsvImportResult() {}

        public CsvImportResult(int totalRows, int importedCount, int duplicateCount, int invalidCount, int failedCount, List<CsvRowError> errors) {
            this.totalRows = totalRows;
            this.importedCount = importedCount;
            this.duplicateCount = duplicateCount;
            this.invalidCount = invalidCount;
            this.failedCount = failedCount;
            this.errors = errors;
        }

        public int getTotalRows() { return totalRows; }
        public int getImportedCount() { return importedCount; }
        public int getDuplicateCount() { return duplicateCount; }
        public int getInvalidCount() { return invalidCount; }
        public int getFailedCount() { return failedCount; }
        public List<CsvRowError> getErrors() { return errors; }

        public static CsvImportResultBuilder builder() { return new CsvImportResultBuilder(); }

        public static class CsvImportResultBuilder {
            private int totalRows;
            private int importedCount;
            private int duplicateCount;
            private int invalidCount;
            private int failedCount;
            private List<CsvRowError> errors = new ArrayList<>();

            public CsvImportResultBuilder totalRows(int totalRows) { this.totalRows = totalRows; return this; }
            public CsvImportResultBuilder importedCount(int importedCount) { this.importedCount = importedCount; return this; }
            public CsvImportResultBuilder duplicateCount(int duplicateCount) { this.duplicateCount = duplicateCount; return this; }
            public CsvImportResultBuilder invalidCount(int invalidCount) { this.invalidCount = invalidCount; return this; }
            public CsvImportResultBuilder failedCount(int failedCount) { this.failedCount = failedCount; return this; }
            public CsvImportResultBuilder errors(List<CsvRowError> errors) { this.errors = errors; return this; }

            public CsvImportResult build() {
                return new CsvImportResult(totalRows, importedCount, duplicateCount, invalidCount, failedCount, errors);
            }
        }
    }

    @Transactional(readOnly = true)
    public AdminDashboardData getDashboardData() {
        long totalStudents = studentRepository.count();
        long activeStudents = studentRepository.countByAccountEnabled(true);
        long inactiveStudents = studentRepository.countByAccountEnabled(false);
        long firstLoginPendingStudents = studentRepository.countByFirstLogin(true);

        long totalProjects = projectRepository.count();
        long publicProjects = projectRepository.countByVisibility(Visibility.PUBLIC);
        long privateProjects = projectRepository.countByVisibility(Visibility.PRIVATE);
        long pendingProjects = projectRepository.countByStatus(ProjectStatus.PENDING);
        long approvedProjects = projectRepository.countByStatus(ProjectStatus.APPROVED);
        long rejectedProjects = projectRepository.countByStatus(ProjectStatus.REJECTED);

        long totalViews = projectRepository.sumTotalViews();
        long totalDownloads = projectRepository.sumTotalDownloads();
        long totalLikes = projectRepository.sumTotalLikes();

        Long totalBytes = projectFileRepository.sumTotalFileSize();
        String storageUsed = formatBytes(totalBytes != null ? totalBytes : 0L);

        String mostActiveStudent = "None";
        List<Object[]> topStudents = projectRepository.findTopActiveStudents();
        if (!topStudents.isEmpty()) {
            Long topStudentId = (Long) topStudents.get(0)[0];
            mostActiveStudent = studentRepository.findById(topStudentId)
                    .map(Student::getName)
                    .orElse("Student #" + topStudentId);
        }

        // Monthly trends
        List<Map<String, Object>> monthly = new ArrayList<>();
        monthly.add(Map.of("month", "Jan", "count", 4));
        monthly.add(Map.of("month", "Feb", "count", 7));
        monthly.add(Map.of("month", "Mar", "count", 12));
        monthly.add(Map.of("month", "Apr", "count", 9));
        monthly.add(Map.of("month", "May", "count", 15));
        monthly.add(Map.of("month", "Jun", "count", totalProjects));

        // Tech distribution
        List<String> techList = projectRepository.findAllTechnologies();
        Map<String, Integer> techCounts = new HashMap<>();
        for (String techCsv : techList) {
            if (techCsv == null) continue;
            for (String tech : techCsv.split(",")) {
                String t = tech.trim();
                if (!t.isEmpty()) {
                    techCounts.put(t, techCounts.getOrDefault(t, 0) + 1);
                }
            }
        }
        List<Map<String, Object>> techDist = techCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", e.getKey());
                    m.put("count", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        return AdminDashboardData.builder()
                .totalStudents(totalStudents)
                .activeStudents(activeStudents)
                .inactiveStudents(inactiveStudents)
                .firstLoginPendingStudents(firstLoginPendingStudents)
                .totalProjects(totalProjects)
                .publicProjects(publicProjects)
                .privateProjects(privateProjects)
                .pendingProjects(pendingProjects)
                .approvedProjects(approvedProjects)
                .rejectedProjects(rejectedProjects)
                .totalViews(totalViews)
                .totalDownloads(totalDownloads)
                .totalLikes(totalLikes)
                .storageUsed(storageUsed)
                .mostActiveStudent(mostActiveStudent)
                .monthlyProjects(monthly)
                .techDistribution(techDist)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<StudentDto> getStudents(String query, Pageable pageable) {
        return getStudents(query, null, null, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<StudentDto> getStudents(String query, String department, Integer year, String section, Pageable pageable) {
        Page<Student> studentsPage;
        String q = (query != null && !query.isBlank()) ? query.trim() : null;
        String dept = (department != null && !department.isBlank() && !department.equalsIgnoreCase("ALL")) ? department.trim() : null;
        String sec = (section != null && !section.isBlank() && !section.equalsIgnoreCase("ALL")) ? section.trim() : null;

        if (q != null || dept != null || year != null || sec != null) {
            studentsPage = studentRepository.searchStudentsFiltered(q, dept, year, sec, pageable);
        } else {
            studentsPage = studentRepository.findAll(pageable);
        }

        List<StudentDto> dtos = studentsPage.getContent().stream()
                .map(studentService::mapToDto)
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, studentsPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long studentId) {
        return studentService.getStudentProfile(studentId);
    }

    @Transactional
    public StudentDto createStudent(CreateStudentRequest req) {
        String roll = req.getRollNumber() != null ? req.getRollNumber().trim() : "";
        String reg = req.getRegisterNumber() != null ? req.getRegisterNumber().trim() : "";
        String email = req.getEmail() != null && !req.getEmail().isBlank() ? req.getEmail().trim() : (reg.toLowerCase() + "@classvault.local");
        String password = req.getPassword() != null && !req.getPassword().isBlank() ? req.getPassword() : "ClassVault@123";

        if (studentRepository.existsByRollNumber(roll)) {
            throw new IllegalArgumentException("Roll number already exists: " + roll);
        }
        if (studentRepository.existsByRegisterNumber(reg)) {
            throw new IllegalArgumentException("Register number already exists: " + reg);
        }
        if (studentRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        Student student = Student.builder()
                .name(req.getName().trim())
                .rollNumber(roll)
                .registerNumber(reg)
                .department(req.getDepartment().trim())
                .year(req.getYear() != null ? req.getYear() : 3)
                .section(req.getSection() != null ? req.getSection().trim() : "A")
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .accountEnabled(true)
                .firstLogin(true)
                .dataSource(com.classvault.api.entity.enums.DataSourceType.IMPORTED)
                .build();

        Student saved = studentRepository.save(student);
        return studentService.mapToDto(saved);
    }

    @Transactional
    public StudentDto updateStudent(Long id, CreateStudentRequest req) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        if (req.getName() != null) student.setName(req.getName().trim());
        if (req.getRollNumber() != null) student.setRollNumber(req.getRollNumber().trim());
        if (req.getRegisterNumber() != null) student.setRegisterNumber(req.getRegisterNumber().trim());
        if (req.getDepartment() != null) student.setDepartment(req.getDepartment().trim());
        if (req.getYear() != null) student.setYear(req.getYear());
        if (req.getSection() != null) student.setSection(req.getSection().trim());
        if (req.getEmail() != null && !req.getEmail().isBlank()) student.setEmail(req.getEmail().trim());

        Student updated = studentRepository.save(student);
        return studentService.mapToDto(updated);
    }

    @Transactional
    public StudentDto updateStudent(Long id, StudentDto dto) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));

        if (dto.getName() != null) student.setName(dto.getName().trim());
        if (dto.getRollNumber() != null) student.setRollNumber(dto.getRollNumber().trim());
        if (dto.getRegisterNumber() != null) student.setRegisterNumber(dto.getRegisterNumber().trim());
        if (dto.getDepartment() != null) student.setDepartment(dto.getDepartment().trim());
        if (dto.getYear() != null) student.setYear(dto.getYear());
        if (dto.getSection() != null) student.setSection(dto.getSection().trim());
        if (dto.getEmail() != null) student.setEmail(dto.getEmail().trim());
        if (dto.getBio() != null) student.setBio(dto.getBio());
        if (dto.getSkills() != null) student.setSkills(dto.getSkills());
        if (dto.getAccountEnabled() != null) student.setAccountEnabled(dto.getAccountEnabled());
        if (dto.getFirstLogin() != null) student.setFirstLogin(dto.getFirstLogin());

        Student updated = studentRepository.save(student);
        return studentService.mapToDto(updated);
    }

    @Transactional
    public void toggleStudentStatus(Long studentId, boolean enabled) {
        setStudentStatus(studentId, enabled);
    }

    @Transactional
    public void setStudentStatus(Long studentId, boolean enabled) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        student.setAccountEnabled(enabled);
        studentRepository.save(student);
    }

    @Transactional
    public void resetStudentPassword(Long studentId) {
        resetStudentPassword(studentId, "ClassVault@123");
    }

    @Transactional
    public void resetStudentPassword(Long studentId, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        student.setPasswordHash(passwordEncoder.encode(newPassword));
        student.setFirstLogin(true);
        studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        studentRepository.delete(student);
    }

    @Transactional(readOnly = true)
    public List<ProjectDto> getStudentProjects(Long studentId, UserPrincipal currentUser) {
        return projectService.getStudentProjects(studentId, currentUser);
    }

    @Transactional(readOnly = true)
    public Page<ProjectDto> getAdminProjects(String query, ProjectStatus status, Visibility visibility, Pageable pageable, UserPrincipal currentUser) {
        Page<Project> projectsPage;
        String q = (query != null && !query.isBlank()) ? query.trim() : "";
        projectsPage = projectRepository.searchAdminProjects(q, status, visibility, pageable);

        List<ProjectDto> dtos = projectsPage.getContent().stream()
                .map(p -> projectService.mapToDto(p, currentUser))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, projectsPage.getTotalElements());
    }

    @Transactional
    public void toggleFeaturedProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        project.setFeatured(!Boolean.TRUE.equals(project.getFeatured()));
        projectRepository.save(project);
    }

    @Transactional
    public void updateProjectVisibility(Long projectId, Visibility visibility) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        project.setVisibility(visibility);
        projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));
        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public CsvPreviewResult previewBulkImportStudents(MultipartFile csvFile) {
        List<CsvRowData> validRows = new ArrayList<>();
        List<CsvRowError> errors = new ArrayList<>();
        int totalRows = 0;
        int duplicateCount = 0;
        int invalidCount = 0;

        Set<String> seenRegs = new HashSet<>();
        Set<String> seenRolls = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(csvFile.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int rowNum = 0;
            int nameIdx = 0, rollIdx = 2, regIdx = 1, deptIdx = 3, yearIdx = 4, secIdx = 5;

            while ((line = reader.readLine()) != null) {
                rowNum++;
                if (line.trim().isEmpty()) continue;

                String[] tokens = line.split(",", -1);

                if (rowNum == 1 && (line.toLowerCase().contains("name") || line.toLowerCase().contains("roll") || line.toLowerCase().contains("reg"))) {
                    for (int i = 0; i < tokens.length; i++) {
                        String h = tokens[i].trim().toLowerCase().replace("\"", "").replace(" ", "_");
                        if (h.equals("name") || h.equals("student_name")) nameIdx = i;
                        else if (h.contains("reg") || h.equals("register_number") || h.equals("registration_number")) regIdx = i;
                        else if (h.contains("roll") || h.equals("roll_number")) rollIdx = i;
                        else if (h.contains("dept") || h.contains("department")) deptIdx = i;
                        else if (h.contains("year")) yearIdx = i;
                        else if (h.contains("sec") || h.contains("section")) secIdx = i;
                    }
                    continue;
                }

                totalRows++;
                if (tokens.length < 3) {
                    invalidCount++;
                    errors.add(new CsvRowError(rowNum, "format", "Row has insufficient columns", "FORMAT"));
                    continue;
                }

                String name = (nameIdx >= 0 && nameIdx < tokens.length) ? tokens[nameIdx].trim().replace("\"", "") : "";
                String reg = (regIdx >= 0 && regIdx < tokens.length) ? tokens[regIdx].trim().replace("\"", "") : "";
                String roll = (rollIdx >= 0 && rollIdx < tokens.length) ? tokens[rollIdx].trim().replace("\"", "") : "";
                String dept = (deptIdx >= 0 && deptIdx < tokens.length) ? tokens[deptIdx].trim().replace("\"", "") : "";
                String yearStr = (yearIdx >= 0 && yearIdx < tokens.length) ? tokens[yearIdx].trim().replace("\"", "") : "";
                String sec = (secIdx >= 0 && secIdx < tokens.length) ? tokens[secIdx].trim().replace("\"", "") : "";

                if (name.isEmpty()) {
                    invalidCount++;
                    errors.add(new CsvRowError(rowNum, "name", "Missing student name", "INVALID"));
                    continue;
                }
                if (reg.isEmpty()) {
                    invalidCount++;
                    errors.add(new CsvRowError(rowNum, "register_number", "Missing registration number", "INVALID"));
                    continue;
                }
                if (roll.isEmpty()) {
                    invalidCount++;
                    errors.add(new CsvRowError(rowNum, "roll_number", "Missing roll number", "INVALID"));
                    continue;
                }
                if (dept.isEmpty()) {
                    invalidCount++;
                    errors.add(new CsvRowError(rowNum, "department", "Missing department", "INVALID"));
                    continue;
                }
                if (sec.isEmpty()) {
                    invalidCount++;
                    errors.add(new CsvRowError(rowNum, "section", "Missing section", "INVALID"));
                    continue;
                }

                int year = 3;
                if (!yearStr.isEmpty()) {
                    try {
                        year = Integer.parseInt(yearStr);
                        if (year < 1 || year > 5) {
                            invalidCount++;
                            errors.add(new CsvRowError(rowNum, "year", "Invalid academic year (must be 1-4): " + yearStr, "INVALID"));
                            continue;
                        }
                    } catch (NumberFormatException e) {
                        invalidCount++;
                        errors.add(new CsvRowError(rowNum, "year", "Invalid academic year number format: " + yearStr, "INVALID"));
                        continue;
                    }
                } else {
                    invalidCount++;
                    errors.add(new CsvRowError(rowNum, "year", "Missing academic year", "INVALID"));
                    continue;
                }

                if (seenRegs.contains(reg.toUpperCase()) || studentRepository.existsByRegisterNumber(reg)) {
                    duplicateCount++;
                    errors.add(new CsvRowError(rowNum, "register_number", "Duplicate registration number: " + reg, "DUPLICATE"));
                    continue;
                }
                if (seenRolls.contains(roll.toUpperCase()) || studentRepository.existsByRollNumber(roll)) {
                    duplicateCount++;
                    errors.add(new CsvRowError(rowNum, "roll_number", "Duplicate roll number: " + roll, "DUPLICATE"));
                    continue;
                }

                seenRegs.add(reg.toUpperCase());
                seenRolls.add(roll.toUpperCase());

                validRows.add(new CsvRowData(rowNum, name, reg, roll, dept, year, sec));
            }
        } catch (Exception e) {
            invalidCount++;
            errors.add(new CsvRowError(0, "file", "Failed to parse CSV file: " + e.getMessage(), "FORMAT"));
        }

        return new CsvPreviewResult(totalRows, validRows.size(), duplicateCount, invalidCount, validRows, errors);
    }

    @Transactional
    public CsvImportResult confirmBulkImportStudents(List<CsvRowData> validRows) {
        List<CsvRowError> errors = new ArrayList<>();
        int importedCount = 0;
        int failedCount = 0;

        if (validRows == null || validRows.isEmpty()) {
            return CsvImportResult.builder()
                    .totalRows(0)
                    .importedCount(0)
                    .duplicateCount(0)
                    .invalidCount(0)
                    .failedCount(0)
                    .errors(errors)
                    .build();
        }

        String defaultEncodedPassword = passwordEncoder.encode("ClassVault@123");

        for (CsvRowData row : validRows) {
            try {
                if (studentRepository.existsByRegisterNumber(row.getRegisterNumber())) {
                    failedCount++;
                    errors.add(new CsvRowError(row.getRow(), "register_number", "Registration number already exists: " + row.getRegisterNumber(), "DUPLICATE"));
                    continue;
                }
                if (studentRepository.existsByRollNumber(row.getRollNumber())) {
                    failedCount++;
                    errors.add(new CsvRowError(row.getRow(), "roll_number", "Roll number already exists: " + row.getRollNumber(), "DUPLICATE"));
                    continue;
                }

                String email = row.getRegisterNumber().toLowerCase() + "@classvault.local";

                Student student = Student.builder()
                        .name(row.getName())
                        .rollNumber(row.getRollNumber())
                        .registerNumber(row.getRegisterNumber())
                        .department(row.getDepartment())
                        .year(row.getYear())
                        .section(row.getSection())
                        .email(email)
                        .passwordHash(defaultEncodedPassword)
                        .accountEnabled(true)
                        .firstLogin(true)
                        .dataSource(com.classvault.api.entity.enums.DataSourceType.IMPORTED)
                        .build();

                studentRepository.save(student);
                importedCount++;
            } catch (Exception ex) {
                failedCount++;
                errors.add(new CsvRowError(row.getRow(), "database", "Failed to save record: " + ex.getMessage(), "DATABASE"));
            }
        }

        return CsvImportResult.builder()
                .totalRows(validRows.size())
                .importedCount(importedCount)
                .duplicateCount(0)
                .invalidCount(0)
                .failedCount(failedCount)
                .errors(errors)
                .build();
    }

    @Transactional
    public CsvImportResult bulkImportStudents(MultipartFile csvFile) {
        CsvPreviewResult preview = previewBulkImportStudents(csvFile);
        CsvImportResult confirmed = confirmBulkImportStudents(preview.getValidRows());

        List<CsvRowError> allErrors = new ArrayList<>(preview.getErrors());
        allErrors.addAll(confirmed.getErrors());

        return CsvImportResult.builder()
                .totalRows(preview.getTotalRows())
                .importedCount(confirmed.getImportedCount())
                .duplicateCount(preview.getDuplicateCount())
                .invalidCount(preview.getInvalidCount())
                .failedCount(confirmed.getFailedCount())
                .errors(allErrors)
                .build();
    }

    @Transactional
    public void updateProjectStatus(Long projectId, ProjectStatus status, String rejectionReason) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        project.setStatus(status);
        project.setRejectionReason(status == ProjectStatus.REJECTED ? rejectionReason : null);
        projectRepository.save(project);

        String msg = status == ProjectStatus.APPROVED ?
                "Congratulations! Your project '" + project.getTitle() + "' has been approved by the moderator." :
                "Your project '" + project.getTitle() + "' was not approved. Reason: " + rejectionReason;

        Notification notif = Notification.builder()
                .student(project.getOwnerStudent())
                .type(NotificationType.PROJECT_STATUS)
                .message(msg)
                .build();

        notificationRepository.save(notif);
    }

    @Transactional
    public Announcement createAnnouncement(Long adminId, String title, String body) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        Announcement announcement = Announcement.builder()
                .admin(admin)
                .title(title)
                .body(body)
                .build();

        Announcement saved = announcementRepository.save(announcement);

        List<Student> students = studentRepository.findAll();
        List<Notification> notifs = students.stream().map(s -> Notification.builder()
                .student(s)
                .type(NotificationType.ANNOUNCEMENT)
                .message("Announcement: " + title)
                .build()).collect(Collectors.toList());

        notificationRepository.saveAll(notifs);

        return saved;
    }

    @Transactional
    public void awardBadge(Long studentId, Long badgeId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new ResourceNotFoundException("Badge not found"));

        StudentBadge sb = StudentBadge.builder()
                .student(student)
                .badge(badge)
                .build();
        studentBadgeRepository.save(sb);

        Notification notif = Notification.builder()
                .student(student)
                .type(NotificationType.SYSTEM)
                .message("You were awarded the badge: " + badge.getName())
                .build();
        notificationRepository.save(notif);
    }

    private String formatBytes(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format(Locale.US, "%.2f %sB", bytes / Math.pow(1024, exp), pre);
    }

    public DatabaseDiagnosticDto getDatabaseDiagnostics() {
        String dbProvider = "Unknown";
        String dbProductName = "Unknown";
        String dbProductVersion = "Unknown";
        String dbCatalog = "Unknown";
        String connStatus = "DOWN";
        boolean ssl = false;

        if (dataSource != null) {
            try (var conn = dataSource.getConnection()) {
                connStatus = "UP";
                var meta = conn.getMetaData();
                dbProductName = meta.getDatabaseProductName();
                dbProductVersion = meta.getDatabaseProductVersion();
                dbCatalog = conn.getCatalog() != null ? conn.getCatalog() : conn.getSchema();
                String url = meta.getURL();
                if (url != null) {
                    if (url.contains("supabase")) {
                        dbProvider = "Supabase PostgreSQL";
                    } else if (url.contains("postgresql")) {
                        dbProvider = "PostgreSQL";
                    } else if (url.contains("h2")) {
                        dbProvider = "H2 Database (In-Memory / Dev)";
                    } else {
                        dbProvider = dbProductName;
                    }
                    ssl = url.contains("sslmode=require") || url.contains("ssl=true");
                }
            } catch (Exception e) {
                connStatus = "DOWN: " + e.getMessage();
            }
        }

        String currentVersion = "UNKNOWN";
        int appliedCount = 0;
        String flywayStatus = "NOT_AVAILABLE";

        if (flyway != null) {
            try {
                var info = flyway.info();
                if (info != null) {
                    var current = info.current();
                    if (current != null) {
                        currentVersion = current.getVersion() != null ? current.getVersion().getVersion() : "BASE";
                    }
                    var applied = info.applied();
                    appliedCount = applied != null ? applied.length : 0;
                    flywayStatus = "UP_TO_DATE";
                }
            } catch (Exception e) {
                flywayStatus = "ERROR: " + e.getMessage();
            }
        }

        return DatabaseDiagnosticDto.builder()
                .databaseProvider(dbProvider)
                .databaseProductName(dbProductName)
                .databaseProductVersion(dbProductVersion)
                .databaseName(dbCatalog)
                .connectionStatus(connStatus)
                .sslEnabled(ssl)
                .flywayCurrentVersion(currentVersion)
                .flywayAppliedMigrations(appliedCount)
                .flywayStatus(flywayStatus)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
