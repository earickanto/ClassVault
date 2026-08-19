package com.classvault.api.repository;

import com.classvault.api.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByProjectIdAndStudentId(Long projectId, Long studentId);
    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);
    void deleteByProjectIdAndStudentId(Long projectId, Long studentId);
}
