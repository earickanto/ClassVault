package com.classvault.api.repository;

import com.classvault.api.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNumber(String rollNumber);

    Optional<Student> findByRegisterNumber(String registerNumber);

    Optional<Student> findByEmail(String email);

    @Query("SELECT s FROM Student s WHERE LOWER(s.rollNumber) = LOWER(:identifier) OR LOWER(s.registerNumber) = LOWER(:identifier) OR LOWER(s.email) = LOWER(:identifier)")
    Optional<Student> findByIdentifier(@Param("identifier") String identifier);

    boolean existsByRollNumber(String rollNumber);

    boolean existsByRegisterNumber(String registerNumber);

    boolean existsByEmail(String email);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.registerNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.department) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    org.springframework.data.domain.Page<Student> searchStudents(@Param("query") String query, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT s FROM Student s WHERE " +
           "((:query IS NULL OR :query = '') OR (" +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "(s.rollNumber IS NOT NULL AND LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "(s.registerNumber IS NOT NULL AND LOWER(s.registerNumber) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "(s.department IS NOT NULL AND LOWER(s.department) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "(s.email IS NOT NULL AND LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))))) AND " +
           "(:department IS NULL OR :department = '' OR LOWER(s.department) = LOWER(:department)) AND " +
           "(:year IS NULL OR s.year = :year) AND " +
           "(:section IS NULL OR :section = '' OR LOWER(s.section) = LOWER(:section))")
    org.springframework.data.domain.Page<Student> searchStudentsFiltered(
            @Param("query") String query,
            @Param("department") String department,
            @Param("year") Integer year,
            @Param("section") String section,
            org.springframework.data.domain.Pageable pageable);

    long countByAccountEnabled(boolean accountEnabled);

    long countByFirstLogin(boolean firstLogin);
}
