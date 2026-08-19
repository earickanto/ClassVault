package com.classvault.api.repository;

import com.classvault.api.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByStudentIdOrderByCreatedAtDesc(Long studentId);
    Optional<Bookmark> findByProjectIdAndStudentId(Long projectId, Long studentId);
    boolean existsByProjectIdAndStudentId(Long projectId, Long studentId);
    void deleteByProjectIdAndStudentId(Long projectId, Long studentId);
}
