package com.classvault.api.service;

import com.classvault.api.dto.StudentDto;
import com.classvault.api.entity.Student;
import com.classvault.api.entity.enums.FileType;
import com.classvault.api.exception.ResourceNotFoundException;
import com.classvault.api.repository.ProjectRepository;
import com.classvault.api.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final ProjectRepository projectRepository;
    private final FileService fileService;
    private final LeaderboardService leaderboardService;

    public StudentService(StudentRepository studentRepository, ProjectRepository projectRepository,
                          FileService fileService, LeaderboardService leaderboardService) {
        this.studentRepository = studentRepository;
        this.projectRepository = projectRepository;
        this.fileService = fileService;
        this.leaderboardService = leaderboardService;
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentProfile(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        return mapToDto(student);
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentProfileByEmail(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + email));
        return mapToDto(student);
    }

    @Transactional
    public StudentDto updateStudentProfile(Long studentId, StudentDto dto) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        // Academic details (Name, Roll, Reg, Dept, Year, Section) are locked to Admin only.
        // Students are permitted to update only self-managed profile details:
        if (dto.getBio() != null) student.setBio(dto.getBio());
        if (dto.getProfilePhotoUrl() != null) student.setProfilePhotoUrl(dto.getProfilePhotoUrl());
        if (dto.getGithubUrl() != null) student.setGithubUrl(dto.getGithubUrl());
        if (dto.getLeetcodeUrl() != null) student.setLeetcodeUrl(dto.getLeetcodeUrl());
        if (dto.getLinkedinUrl() != null) student.setLinkedinUrl(dto.getLinkedinUrl());
        if (dto.getPortfolioUrl() != null) student.setPortfolioUrl(dto.getPortfolioUrl());
        if (dto.getSkills() != null) student.setSkills(dto.getSkills());

        Student updated = studentRepository.save(student);
        return mapToDto(updated);
    }

    @Transactional
    public StudentDto uploadProfilePhoto(Long studentId, MultipartFile file) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        String url = fileService.storeFile(file, FileType.IMAGE, "avatars");
        student.setProfilePhotoUrl(url);

        Student updated = studentRepository.save(student);
        return mapToDto(updated);
    }

    public int calculateCompletionPercentage(Student student) {
        int score = 40; // Base: Official Academic identity (Name, Roll, Register, Department, Year, Section, Email)
        if (student.getProfilePhotoUrl() != null && !student.getProfilePhotoUrl().isBlank()) score += 10;
        if (student.getBio() != null && !student.getBio().isBlank()) score += 10;
        if (student.getSkills() != null && !student.getSkills().isBlank()) score += 10;

        int socialCount = 0;
        if (student.getGithubUrl() != null && !student.getGithubUrl().isBlank()) socialCount++;
        if (student.getLeetcodeUrl() != null && !student.getLeetcodeUrl().isBlank()) socialCount++;
        if (student.getLinkedinUrl() != null && !student.getLinkedinUrl().isBlank()) socialCount++;
        if (student.getPortfolioUrl() != null && !student.getPortfolioUrl().isBlank()) socialCount++;

        score += Math.min(socialCount * 5, 20); // 4 developer links x 5% = 20%

        long projectCount = projectRepository.countByOwnerStudentId(student.getId());
        if (projectCount > 0) score += 10;

        return Math.min(score, 100);
    }

    public StudentDto mapToDto(Student student) {
        long projectCount = projectRepository.countByOwnerStudentId(student.getId());
        int completion = calculateCompletionPercentage(student);

        LeaderboardService.LeaderboardEntry rankEntry = leaderboardService.getStudentRank(student.getId());
        int rank = rankEntry != null ? rankEntry.getRank() : 1;
        int percentile = rankEntry != null ? rankEntry.getPercentile() : 100;
        long totalStudents = studentRepository.count();

        return StudentDto.builder()
                .id(student.getId())
                .name(student.getName())
                .rollNumber(student.getRollNumber())
                .registerNumber(student.getRegisterNumber())
                .department(student.getDepartment())
                .year(student.getYear())
                .section(student.getSection())
                .email(student.getEmail())
                .profilePhotoUrl(student.getProfilePhotoUrl())
                .bio(student.getBio())
                .githubUrl(student.getGithubUrl())
                .leetcodeUrl(student.getLeetcodeUrl())
                .linkedinUrl(student.getLinkedinUrl())
                .portfolioUrl(student.getPortfolioUrl())
                .skills(student.getSkills())
                .accountEnabled(student.getAccountEnabled())
                .firstLogin(student.getFirstLogin())
                .dataSource(student.getDataSource())
                .joinedAt(student.getJoinedAt())
                .completionPercentage(completion)
                .leaderboardRank(rank)
                .percentileAhead(percentile)
                .totalClassStudents(totalStudents)
                .projectCount(projectCount)
                .build();
    }
}
