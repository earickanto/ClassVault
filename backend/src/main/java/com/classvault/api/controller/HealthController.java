package com.classvault.api.controller;

import com.classvault.api.dto.ApiResponse;
import com.classvault.api.dto.HealthCheckResponse;
import com.classvault.api.service.HealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HealthCheckResponse>> checkHealth() {
        HealthCheckResponse healthStatus = healthService.getHealthStatus();
        return ResponseEntity.ok(ApiResponse.success("System operational", healthStatus));
    }
}
