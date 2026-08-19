package com.classvault.api.repository;

import com.classvault.api.entity.LeaderboardSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LeaderboardSnapshotRepository extends JpaRepository<LeaderboardSnapshot, Long> {
    List<LeaderboardSnapshot> findAllByOrderByRankPositionAsc();
}
