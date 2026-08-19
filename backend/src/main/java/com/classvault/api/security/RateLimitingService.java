package com.classvault.api.security;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private static class AttemptTracker {
        int attempts;
        long lastAttemptTime;

        AttemptTracker(int attempts, long lastAttemptTime) {
            this.attempts = attempts;
            this.lastAttemptTime = lastAttemptTime;
        }
    }

    private final Map<String, AttemptTracker> attemptsMap = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 10;
    private static final long LOCK_TIME_DURATION = 15 * 60 * 1000; // 15 minutes

    public boolean isRateLimited(String clientIp) {
        AttemptTracker tracker = attemptsMap.get(clientIp);
        if (tracker == null) {
            return false;
        }

        if (System.currentTimeMillis() - tracker.lastAttemptTime > LOCK_TIME_DURATION) {
            attemptsMap.remove(clientIp);
            return false;
        }

        return tracker.attempts >= MAX_ATTEMPTS;
    }

    public void loginFailed(String clientIp) {
        long now = System.currentTimeMillis();
        attemptsMap.compute(clientIp, (key, tracker) -> {
            if (tracker == null || now - tracker.lastAttemptTime > LOCK_TIME_DURATION) {
                return new AttemptTracker(1, now);
            }
            tracker.attempts++;
            tracker.lastAttemptTime = now;
            return tracker;
        });
    }

    public void loginSucceeded(String clientIp) {
        attemptsMap.remove(clientIp);
    }
}
