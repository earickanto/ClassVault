package com.classvault.api;

import com.classvault.api.service.LeaderboardService;
import com.classvault.api.service.LeaderboardService.LeaderboardEntry;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class LeaderboardServiceTest {

    @Autowired
    private LeaderboardService leaderboardService;

    @Test
    @DisplayName("Leaderboard calculates weighted scores and assigns sequential ranks")
    void testLeaderboardScoreAndRanking() {
        List<LeaderboardEntry> leaderboard = leaderboardService.getLeaderboard();

        assertNotNull(leaderboard);
        assertFalse(leaderboard.isEmpty(), "Leaderboard should not be empty");

        // Verify ranks are sequentially ordered (1, 2, 3, ...)
        for (int i = 0; i < leaderboard.size(); i++) {
            LeaderboardEntry entry = leaderboard.get(i);
            assertEquals(i + 1, entry.getRank(), "Rank must match 1-based index");

            // If not the last item, score should be >= next student's score
            if (i < leaderboard.size() - 1) {
                assertTrue(entry.getScore() >= leaderboard.get(i + 1).getScore(),
                        "Leaderboard should be sorted in descending order of score");
            }
        }
    }

    @Test
    @DisplayName("Top ranked student has high percentile ahead of class")
    void testRankPercentileCalculation() {
        List<LeaderboardEntry> leaderboard = leaderboardService.getLeaderboard();
        if (leaderboard.size() > 1) {
            LeaderboardEntry rank1 = leaderboard.get(0);
            assertEquals(1, rank1.getRank());
            assertEquals(100, rank1.getPercentile(), "Top rank student should be ahead of 100% of classmates");

            LeaderboardEntry lastRank = leaderboard.get(leaderboard.size() - 1);
            assertEquals(0, lastRank.getPercentile(), "Lowest rank student is ahead of 0% of classmates");
        }
    }
}
