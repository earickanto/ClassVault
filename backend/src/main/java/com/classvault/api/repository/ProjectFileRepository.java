package com.classvault.api.repository;

import com.classvault.api.entity.ProjectFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProjectFileRepository extends JpaRepository<ProjectFile, Long> {
    List<ProjectFile> findByProjectId(Long projectId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(pf.fileSize), 0) FROM ProjectFile pf")
    Long sumTotalFileSize();
}
