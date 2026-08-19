package com.classvault.api.service;

import com.classvault.api.dto.HealthCheckResponse;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.time.LocalDateTime;

@Service
public class HealthService {

    private final JdbcTemplate jdbcTemplate;

    public HealthService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public HealthCheckResponse getHealthStatus() {
        String dbStatus = "UP";
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
        } catch (Exception e) {
            dbStatus = "DOWN: " + e.getMessage();
        }

        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();

        return HealthCheckResponse.builder()
                .status("UP")
                .database(dbStatus)
                .service("ClassVault API Service")
                .version("1.0.0")
                .uptimeSeconds(uptimeMs / 1000)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
