package com.classvault.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "roll_number", nullable = false, unique = true, length = 50)
    private String rollNumber;

    @Column(name = "register_number", nullable = false, unique = true, length = 50)
    private String registerNumber;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(name = "\"year\"", nullable = false)
    private Integer year = 3;

    @Column(nullable = false, length = 10)
    private String section = "A";

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "leetcode_url")
    private String leetcodeUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(name = "account_enabled", nullable = false)
    private Boolean accountEnabled = true;

    @Column(name = "first_login", nullable = false)
    private Boolean firstLogin = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "data_source", nullable = false, length = 20)
    private com.classvault.api.entity.enums.DataSourceType dataSource = com.classvault.api.entity.enums.DataSourceType.IMPORTED;

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    public Student() {}

    public Student(Long id, String name, String rollNumber, String registerNumber, String department,
                   Integer year, String section, String email, String passwordHash, String profilePhotoUrl,
                   String bio, String githubUrl, String leetcodeUrl, String linkedinUrl, String portfolioUrl,
                   String skills, Boolean accountEnabled, Boolean firstLogin,
                   com.classvault.api.entity.enums.DataSourceType dataSource, LocalDateTime joinedAt) {
        this.id = id;
        this.name = name;
        this.rollNumber = rollNumber;
        this.registerNumber = registerNumber;
        this.department = department;
        this.year = year != null ? year : 3;
        this.section = section != null ? section : "A";
        this.email = email;
        this.passwordHash = passwordHash;
        this.profilePhotoUrl = profilePhotoUrl;
        this.bio = bio;
        this.githubUrl = githubUrl;
        this.leetcodeUrl = leetcodeUrl;
        this.linkedinUrl = linkedinUrl;
        this.portfolioUrl = portfolioUrl;
        this.skills = skills;
        this.accountEnabled = accountEnabled != null ? accountEnabled : true;
        this.firstLogin = firstLogin != null ? firstLogin : true;
        this.dataSource = dataSource != null ? dataSource : com.classvault.api.entity.enums.DataSourceType.IMPORTED;
        this.joinedAt = joinedAt;
    }

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getLeetcodeUrl() { return leetcodeUrl; }
    public void setLeetcodeUrl(String leetcodeUrl) { this.leetcodeUrl = leetcodeUrl; }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getPortfolioUrl() { return portfolioUrl; }
    public void setPortfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public Boolean getAccountEnabled() { return accountEnabled; }
    public void setAccountEnabled(Boolean accountEnabled) { this.accountEnabled = accountEnabled; }

    public Boolean getFirstLogin() { return firstLogin; }
    public void setFirstLogin(Boolean firstLogin) { this.firstLogin = firstLogin; }

    public com.classvault.api.entity.enums.DataSourceType getDataSource() { return dataSource; }
    public void setDataSource(com.classvault.api.entity.enums.DataSourceType dataSource) { this.dataSource = dataSource; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }

    public static StudentBuilder builder() { return new StudentBuilder(); }

    public static class StudentBuilder {
        private Long id;
        private String name;
        private String rollNumber;
        private String registerNumber;
        private String department;
        private Integer year = 3;
        private String section = "A";
        private String email;
        private String passwordHash;
        private String profilePhotoUrl;
        private String bio;
        private String githubUrl;
        private String leetcodeUrl;
        private String linkedinUrl;
        private String portfolioUrl;
        private String skills;
        private Boolean accountEnabled = true;
        private Boolean firstLogin = true;
        private com.classvault.api.entity.enums.DataSourceType dataSource = com.classvault.api.entity.enums.DataSourceType.IMPORTED;
        private LocalDateTime joinedAt;

        public StudentBuilder id(Long id) { this.id = id; return this; }
        public StudentBuilder name(String name) { this.name = name; return this; }
        public StudentBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
        public StudentBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public StudentBuilder department(String department) { this.department = department; return this; }
        public StudentBuilder year(Integer year) { this.year = year; return this; }
        public StudentBuilder section(String section) { this.section = section; return this; }
        public StudentBuilder email(String email) { this.email = email; return this; }
        public StudentBuilder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public StudentBuilder profilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; return this; }
        public StudentBuilder bio(String bio) { this.bio = bio; return this; }
        public StudentBuilder githubUrl(String githubUrl) { this.githubUrl = githubUrl; return this; }
        public StudentBuilder leetcodeUrl(String leetcodeUrl) { this.leetcodeUrl = leetcodeUrl; return this; }
        public StudentBuilder linkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; return this; }
        public StudentBuilder portfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; return this; }
        public StudentBuilder skills(String skills) { this.skills = skills; return this; }
        public StudentBuilder accountEnabled(Boolean accountEnabled) { this.accountEnabled = accountEnabled; return this; }
        public StudentBuilder firstLogin(Boolean firstLogin) { this.firstLogin = firstLogin; return this; }
        public StudentBuilder dataSource(com.classvault.api.entity.enums.DataSourceType dataSource) { this.dataSource = dataSource; return this; }
        public StudentBuilder joinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; return this; }

        public Student build() {
            return new Student(id, name, rollNumber, registerNumber, department, year, section, email,
                    passwordHash, profilePhotoUrl, bio, githubUrl, leetcodeUrl, linkedinUrl, portfolioUrl,
                    skills, accountEnabled, firstLogin, dataSource, joinedAt);
        }
    }
}
