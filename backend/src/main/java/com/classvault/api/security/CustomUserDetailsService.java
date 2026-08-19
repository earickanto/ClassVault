package com.classvault.api.security;

import com.classvault.api.entity.Admin;
import com.classvault.api.entity.Student;
import com.classvault.api.repository.AdminRepository;
import com.classvault.api.repository.StudentRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final StudentRepository studentRepository;
    private final AdminRepository adminRepository;

    public CustomUserDetailsService(StudentRepository studentRepository, AdminRepository adminRepository) {
        this.studentRepository = studentRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        if (identifier == null || identifier.isBlank()) {
            throw new UsernameNotFoundException("Identifier cannot be blank");
        }
        String trimmed = identifier.trim();

        Optional<Admin> adminOpt = adminRepository.findByEmailIgnoreCase(trimmed);
        if (adminOpt.isPresent()) {
            return UserPrincipal.create(adminOpt.get());
        }

        Optional<Student> studentOpt = studentRepository.findByIdentifier(trimmed);
        if (studentOpt.isPresent()) {
            return UserPrincipal.create(studentOpt.get());
        }

        throw new UsernameNotFoundException("User not found with identifier: " + identifier);
    }
}
