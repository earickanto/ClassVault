package com.classvault.api.dto;

public class JwtAuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long id;
    private String name;
    private String email;
    private String role;
    private String rollNumber;
    private String registerNumber;
    private String profilePhotoUrl;
    private Boolean firstLogin;

    public JwtAuthResponse() {}

    public JwtAuthResponse(String accessToken, String refreshToken, String tokenType, Long id,
                           String name, String email, String role, String rollNumber, String registerNumber,
                           String profilePhotoUrl, Boolean firstLogin) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType != null ? tokenType : "Bearer";
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.rollNumber = rollNumber;
        this.registerNumber = registerNumber;
        this.profilePhotoUrl = profilePhotoUrl;
        this.firstLogin = firstLogin != null ? firstLogin : false;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) { this.registerNumber = registerNumber; }

    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public void setProfilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; }

    public Boolean getFirstLogin() { return firstLogin; }
    public void setFirstLogin(Boolean firstLogin) { this.firstLogin = firstLogin; }

    public static JwtAuthResponseBuilder builder() { return new JwtAuthResponseBuilder(); }

    public static class JwtAuthResponseBuilder {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private Long id;
        private String name;
        private String email;
        private String role;
        private String rollNumber;
        private String registerNumber;
        private String profilePhotoUrl;
        private Boolean firstLogin = false;

        public JwtAuthResponseBuilder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public JwtAuthResponseBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }
        public JwtAuthResponseBuilder tokenType(String tokenType) { this.tokenType = tokenType; return this; }
        public JwtAuthResponseBuilder id(Long id) { this.id = id; return this; }
        public JwtAuthResponseBuilder name(String name) { this.name = name; return this; }
        public JwtAuthResponseBuilder email(String email) { this.email = email; return this; }
        public JwtAuthResponseBuilder role(String role) { this.role = role; return this; }
        public JwtAuthResponseBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
        public JwtAuthResponseBuilder registerNumber(String registerNumber) { this.registerNumber = registerNumber; return this; }
        public JwtAuthResponseBuilder profilePhotoUrl(String profilePhotoUrl) { this.profilePhotoUrl = profilePhotoUrl; return this; }
        public JwtAuthResponseBuilder firstLogin(Boolean firstLogin) { this.firstLogin = firstLogin; return this; }

        public JwtAuthResponse build() {
            return new JwtAuthResponse(accessToken, refreshToken, tokenType, id, name, email, role, rollNumber, registerNumber, profilePhotoUrl, firstLogin);
        }
    }
}
