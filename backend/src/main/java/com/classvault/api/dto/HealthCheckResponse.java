package com.classvault.api.dto;

import java.time.LocalDateTime;

public class HealthCheckResponse {

    private String status;
    private String database;
    private String service;
    private String version;
    private Long uptimeSeconds;
    private LocalDateTime timestamp;

    public HealthCheckResponse() {}

    public HealthCheckResponse(String status, String database, String service, String version, Long uptimeSeconds, LocalDateTime timestamp) {
        this.status = status;
        this.database = database;
        this.service = service;
        this.version = version;
        this.uptimeSeconds = uptimeSeconds;
        this.timestamp = timestamp;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDatabase() { return database; }
    public void setDatabase(String database) { this.database = database; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public Long getUptimeSeconds() { return uptimeSeconds; }
    public void setUptimeSeconds(Long uptimeSeconds) { this.uptimeSeconds = uptimeSeconds; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public static HealthCheckResponseBuilder builder() { return new HealthCheckResponseBuilder(); }

    public static class HealthCheckResponseBuilder {
        private String status;
        private String database;
        private String service;
        private String version;
        private Long uptimeSeconds;
        private LocalDateTime timestamp;

        public HealthCheckResponseBuilder status(String status) { this.status = status; return this; }
        public HealthCheckResponseBuilder database(String database) { this.database = database; return this; }
        public HealthCheckResponseBuilder service(String service) { this.service = service; return this; }
        public HealthCheckResponseBuilder version(String version) { this.version = version; return this; }
        public HealthCheckResponseBuilder uptimeSeconds(Long uptimeSeconds) { this.uptimeSeconds = uptimeSeconds; return this; }
        public HealthCheckResponseBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public HealthCheckResponse build() {
            return new HealthCheckResponse(status, database, service, version, uptimeSeconds, timestamp);
        }
    }
}
