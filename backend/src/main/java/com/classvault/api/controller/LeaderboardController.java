package com.classvault.api.controller;

import com.classvault.api.dto.ApiResponse;
import com.classvault.api.service.LeaderboardService;
import com.classvault.api.service.LeaderboardService.LeaderboardEntry;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<LeaderboardEntry>>> getLeaderboard() {
        List<LeaderboardEntry> leaderboard = leaderboardService.getLeaderboard();
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<LeaderboardEntry>> getStudentRank(@PathVariable Long studentId) {
        LeaderboardEntry rank = leaderboardService.getStudentRank(studentId);
        return ResponseEntity.ok(ApiResponse.success(rank));
    }
}
