package com.classvault.api.repository;

import com.classvault.api.entity.StudentBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentBadgeRepository extends JpaRepository<StudentBadge, Long> {
    List<StudentBadge> findByStudentId(Long studentId);
}
