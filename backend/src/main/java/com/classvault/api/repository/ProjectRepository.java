package com.classvault.api.repository;

import com.classvault.api.entity.Project;
import com.classvault.api.entity.enums.ProjectStatus;
import com.classvault.api.entity.enums.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByOwnerStudentId(Long studentId);

    List<Project> findByOwnerStudentIdAndStatus(Long studentId, ProjectStatus status);

    Page<Project> findByVisibilityAndStatus(Visibility visibility, ProjectStatus status, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.status = :status AND p.visibility = 'PUBLIC' AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.technologyUsed) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.ownerStudent.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.ownerStudent.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Project> searchPublicProjects(@Param("query") String query, @Param("status") ProjectStatus status, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.status = 'APPROVED' AND p.visibility = 'PUBLIC' AND " +
           "(:category IS NULL OR :category = 'ALL' OR p.category = :category) AND " +
           "(:semester IS NULL OR p.semester = :semester) AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.technologyUsed) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.ownerStudent.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.ownerStudent.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Project> searchPublicProjectsFiltered(@Param("query") String query,
                                               @Param("category") String category,
                                               @Param("semester") Integer semester,
                                               Pageable pageable);

    @Query("SELECT p FROM Project p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:visibility IS NULL OR p.visibility = :visibility) AND (" +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.technologyUsed) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.ownerStudent.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.ownerStudent.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Project> searchAdminProjects(@Param("query") String query,
                                      @Param("status") ProjectStatus status,
                                      @Param("visibility") Visibility visibility,
                                      Pageable pageable);

    long countByOwnerStudentId(Long studentId);

    long countByOwnerStudentIdAndVisibility(Long studentId, Visibility visibility);

    long countByStatus(ProjectStatus status);

    long countByVisibility(Visibility visibility);

    @Query("SELECT SUM(p.likesCount) FROM Project p WHERE p.ownerStudent.id = :studentId")
    Long sumLikesByOwnerStudentId(@Param("studentId") Long studentId);

    @Query("SELECT SUM(p.downloadsCount) FROM Project p WHERE p.ownerStudent.id = :studentId")
    Long sumDownloadsByOwnerStudentId(@Param("studentId") Long studentId);

    @Query("SELECT SUM(p.viewsCount) FROM Project p WHERE p.ownerStudent.id = :studentId")
    Long sumViewsByOwnerStudentId(@Param("studentId") Long studentId);

    @Query("SELECT COALESCE(SUM(p.viewsCount), 0) FROM Project p")
    Long sumTotalViews();

    @Query("SELECT COALESCE(SUM(p.downloadsCount), 0) FROM Project p")
    Long sumTotalDownloads();

    @Query("SELECT COALESCE(SUM(p.likesCount), 0) FROM Project p")
    Long sumTotalLikes();

    @Query("SELECT p.technologyUsed FROM Project p")
    List<String> findAllTechnologies();

    @Query("SELECT p.ownerStudent.id, COUNT(p) as cnt FROM Project p GROUP BY p.ownerStudent.id ORDER BY cnt DESC")
    List<Object[]> findTopActiveStudents();
}
