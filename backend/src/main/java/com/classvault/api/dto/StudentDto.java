package com.classvault.api.dto;

import java.time.LocalDateTime;

public class StudentDto {

    private Long id;
    private String name;
    private String rollNumber;
    private String registerNumber;
    private String department;
    private Integer year;
    private String section;
    private String email;
    private String profilePhotoUrl;
    private String bio;
    private String githubUrl;
    private String leetcodeUrl;
    private String linkedinUrl;
    private String portfolioUrl;
    private String skills;
    private Boolean accountEnabled;
    private Boolean firstLogin;
    private com.classvault.api.entity.enums.DataSourceType dataSource;
    private LocalDateTime joinedAt;

    private Integer completionPercentage;
    private Integer leaderboardRank;
    private Integer percentileAhead;
    private Long totalClassStudents;
    private Long projectCount;

    public StudentDto() {}

    public StudentDto(Long id, String name, String rollNumber, String registerNumber, String department,
                      Integer year, String section, String email, String profilePhotoUrl, String bio,
                      String githubUrl, String leetcodeUrl, String linkedinUrl, String portfolioUrl,
                      String skills, Boolean accountEnabled, Boolean firstLogin,
                      com.classvault.api.entity.enums.DataSourceType dataSource, LocalDateTime joinedAt,
                      Integer completionPercentage, Integer leaderboardRank, Integer percentileAhead,
                      Long totalClassStudents, Long projectCount) {
        this.id = id;
        this.name = name;
        this.rollNumber = rollNumber;
        this.registerNumber = registerNumber;
        this.department = department;
        this.year = year;
        this.section = section;
        this.email = email;
        this.profilePhotoUrl = profilePhotoUrl;
        this.bio = bio;
        this.githubUrl = githubUrl;
        this.leetcodeUrl = leetcodeUrl;
        this.linkedinUrl = linkedinUrl;
        this.portfolioUrl = portfolioUrl;
        this.skills = skills;
        this.accountEnabled = accountEnabled;
        this.firstLogin = firstLogin;
        this.dataSource = dataSource;
        this.joinedAt = joinedAt;
        this.completionPercentage = completionPercentage;
        this.leaderboardRank = leaderboardRank;
        this.percentileAhead = percentileAhead;
        this.totalClassStudents = totalClassStudents;
        this.projectCount = projectCount;
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

    public Integer getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; }

    public Integer getLeaderboardRank() { return leaderboardRank; }
    public void setLeaderboardRank(Integer leaderboardRank) { this.leaderboardRank = leaderboardRank; }

    public Integer getPercentileAhead() { return percentileAhead; }
    public void setPercentileAhead(Integer percentileAhead) { this.percentileAhead = percentileAhead; }

    public Long getTotalClassStudents() { return totalClassStudents; }
    public void setTotalClassStudents(Long totalClassStudents) { this.totalClassStudents = totalClassStudents; }

    public Long getProjectCount() { return projectCount; }
    public void setProjectCount(Long projectCount) { this.projectCount = projectCount; }

    public static StudentDtoBuilder builder() { return new StudentDtoBuilder(); }

    public static class StudentDtoBuilder {
        private Long id;
        private String name;
        private String rollNumber;
        private String registerNumber;
        private String department;
        private Integer year;
        private String section;
        private String email;
        private String profilePhotoUrl;
        private String bio;
        private String githubUrl;
        private String leetcodeUrl;
        private String linkedinUrl;
        private String portfolioUrl;
        private String skills;
        private Boolean accountEnabled;
        private Boolean firstLogin;
        private com.classvault.api.entity.enums.DataSourceType dataSource;
        private LocalDateTime joinedAt;
        private Integer completionPercentage;
        private Integer leaderboardRank;
        private Integer percentileAhead;
        private Long totalClassStudents;
        private Long projectCount;

        public StudentDtoBuilder id(Long id) { this.id = id; return this; }
        public StudentDtoBuilder name(String name) { this.name = name; return this; }
        public StudentDtoBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
        public StudentDtoBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public StudentDtoBuilder department(String department) { this.department = department; return this; }
        public StudentDtoBuilder year(Integer year) { this.year = year; return this; }
        public StudentDtoBuilder section(String section) { this.section = section; return this; }
        public StudentDtoBuilder email(String email) { this.email = email; return this; }
        public StudentDtoBuilder profilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; return this; }
        public StudentDtoBuilder bio(String bio) { this.bio = bio; return this; }
        public StudentDtoBuilder githubUrl(String githubUrl) { this.githubUrl = githubUrl; return this; }
        public StudentDtoBuilder leetcodeUrl(String leetcodeUrl) { this.leetcodeUrl = leetcodeUrl; return this; }
        public StudentDtoBuilder linkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; return this; }
        public StudentDtoBuilder portfolioUrl(String portfolioUrl) { this.portfolioUrl = portfolioUrl; return this; }
        public StudentDtoBuilder skills(String skills) { this.skills = skills; return this; }
        public StudentDtoBuilder accountEnabled(Boolean accountEnabled) { this.accountEnabled = accountEnabled; return this; }
        public StudentDtoBuilder firstLogin(Boolean firstLogin) { this.firstLogin = firstLogin; return this; }
        public StudentDtoBuilder dataSource(com.classvault.api.entity.enums.DataSourceType dataSource) { this.dataSource = dataSource; return this; }
        public StudentDtoBuilder joinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; return this; }
        public StudentDtoBuilder completionPercentage(Integer completionPercentage) { this.completionPercentage = completionPercentage; return this; }
        public StudentDtoBuilder leaderboardRank(Integer leaderboardRank) { this.leaderboardRank = leaderboardRank; return this; }
        public StudentDtoBuilder percentileAhead(Integer percentileAhead) { this.percentileAhead = percentileAhead; return this; }
        public StudentDtoBuilder totalClassStudents(Long totalClassStudents) { this.totalClassStudents = totalClassStudents; return this; }
        public StudentDtoBuilder projectCount(Long projectCount) { this.projectCount = projectCount; return this; }

        public StudentDto build() {
            return new StudentDto(id, name, rollNumber, registerNumber, department, year, section, email,
                    profilePhotoUrl, bio, githubUrl, leetcodeUrl, linkedinUrl, portfolioUrl, skills,
                    accountEnabled, firstLogin, dataSource, joinedAt, completionPercentage, leaderboardRank, percentileAhead,
                    totalClassStudents, projectCount);
        }
    }
}
