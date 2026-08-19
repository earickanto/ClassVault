package com.classvault.api.security;

import com.classvault.api.entity.Admin;
import com.classvault.api.entity.Student;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private Long id;
    private String name;
    private String email;
    private String password;
    private String role;
    private String rollNumber;
    private String registerNumber;
    private String profilePhotoUrl;
    private boolean enabled = true;
    private boolean firstLogin = false;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal() {}

    public UserPrincipal(Long id, String name, String email, String password, String role,
                         String rollNumber, String profilePhotoUrl, boolean enabled,
                         Collection<? extends GrantedAuthority> authorities) {
        this(id, name, email, password, role, rollNumber, null, profilePhotoUrl, enabled, false, authorities);
    }

    public UserPrincipal(Long id, String name, String email, String password, String role,
                          String rollNumber, String registerNumber, String profilePhotoUrl,
                          boolean enabled, boolean firstLogin, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.rollNumber = rollNumber;
        this.registerNumber = registerNumber;
        this.profilePhotoUrl = profilePhotoUrl;
        this.enabled = enabled;
        this.firstLogin = firstLogin;
        this.authorities = authorities;
    }

    public static UserPrincipal create(Student student) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_STUDENT");
        boolean isEnabled = student.getAccountEnabled() != null ? student.getAccountEnabled() : true;
        boolean isFirstLogin = student.getFirstLogin() != null ? student.getFirstLogin() : true;
        return new UserPrincipal(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getPasswordHash(),
                "ROLE_STUDENT",
                student.getRollNumber(),
                student.getRegisterNumber(),
                student.getProfilePhotoUrl(),
                isEnabled,
                isFirstLogin,
                Collections.singletonList(authority)
        );
    }

    public static UserPrincipal create(Admin admin) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_ADMIN");
        return new UserPrincipal(
                admin.getId(),
                admin.getName(),
                admin.getEmail(),
                admin.getPasswordHash(),
                "ROLE_ADMIN",
                null,
                null,
                null,
                true,
                false,
                Collections.singletonList(authority)
        );
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getRollNumber() { return rollNumber; }
    public String getRegisterNumber() { return registerNumber; }
    public String getProfilePhotoUrl() { return profilePhotoUrl; }
    public boolean isFirstLogin() { return firstLogin; }

    @Override
    public String getPassword() { return password; }

    @Override
    public String getUsername() { return email != null ? email : (registerNumber != null ? registerNumber : rollNumber); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return enabled; }
}
