package com.classvault.api.dto;

import java.time.LocalDateTime;

public class DatabaseDiagnosticDto {
    private String databaseProvider;
    private String databaseProductName;
    private String databaseProductVersion;
    private String databaseName;
    private String connectionStatus;
    private boolean sslEnabled;
    private String flywayCurrentVersion;
    private int flywayAppliedMigrations;
    private String flywayStatus;
    private LocalDateTime timestamp;

    public DatabaseDiagnosticDto() {}

    public DatabaseDiagnosticDto(String databaseProvider, String databaseProductName, String databaseProductVersion,
                                 String databaseName, String connectionStatus, boolean sslEnabled,
                                 String flywayCurrentVersion, int flywayAppliedMigrations,
                                 String flywayStatus, LocalDateTime timestamp) {
        this.databaseProvider = databaseProvider;
        this.databaseProductName = databaseProductName;
        this.databaseProductVersion = databaseProductVersion;
        this.databaseName = databaseName;
        this.connectionStatus = connectionStatus;
        this.sslEnabled = sslEnabled;
        this.flywayCurrentVersion = flywayCurrentVersion;
        this.flywayAppliedMigrations = flywayAppliedMigrations;
        this.flywayStatus = flywayStatus;
        this.timestamp = timestamp;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String databaseProvider;
        private String databaseProductName;
        private String databaseProductVersion;
        private String databaseName;
        private String connectionStatus;
        private boolean sslEnabled;
        private String flywayCurrentVersion;
        private int flywayAppliedMigrations;
        private String flywayStatus;
        private LocalDateTime timestamp;

        public Builder databaseProvider(String databaseProvider) { this.databaseProvider = databaseProvider; return this; }
        public Builder databaseProductName(String databaseProductName) { this.databaseProductName = databaseProductName; return this; }
        public Builder databaseProductVersion(String databaseProductVersion) { this.databaseProductVersion = databaseProductVersion; return this; }
        public Builder databaseName(String databaseName) { this.databaseName = databaseName; return this; }
        public Builder connectionStatus(String connectionStatus) { this.connectionStatus = connectionStatus; return this; }
        public Builder sslEnabled(boolean sslEnabled) { this.sslEnabled = sslEnabled; return this; }
        public Builder flywayCurrentVersion(String flywayCurrentVersion) { this.flywayCurrentVersion = flywayCurrentVersion; return this; }
        public Builder flywayAppliedMigrations(int flywayAppliedMigrations) { this.flywayAppliedMigrations = flywayAppliedMigrations; return this; }
        public Builder flywayStatus(String flywayStatus) { this.flywayStatus = flywayStatus; return this; }
        public Builder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public DatabaseDiagnosticDto build() {
            return new DatabaseDiagnosticDto(databaseProvider, databaseProductName, databaseProductVersion,
                    databaseName, connectionStatus, sslEnabled, flywayCurrentVersion,
                    flywayAppliedMigrations, flywayStatus, timestamp);
        }
    }

    public String getDatabaseProvider() { return databaseProvider; }
    public void setDatabaseProvider(String databaseProvider) { this.databaseProvider = databaseProvider; }

    public String getDatabaseProductName() { return databaseProductName; }
    public void setDatabaseProductName(String databaseProductName) { this.databaseProductName = databaseProductName; }

    public String getDatabaseProductVersion() { return databaseProductVersion; }
    public void setDatabaseProductVersion(String databaseProductVersion) { this.databaseProductVersion = databaseProductVersion; }

    public String getDatabaseName() { return databaseName; }
    public void setDatabaseName(String databaseName) { this.databaseName = databaseName; }

    public String getConnectionStatus() { return connectionStatus; }
    public void setConnectionStatus(String connectionStatus) { this.connectionStatus = connectionStatus; }

    public boolean isSslEnabled() { return sslEnabled; }
    public void setSslEnabled(boolean sslEnabled) { this.sslEnabled = sslEnabled; }

    public String getFlywayCurrentVersion() { return flywayCurrentVersion; }
    public void setFlywayCurrentVersion(String flywayCurrentVersion) { this.flywayCurrentVersion = flywayCurrentVersion; }

    public int getFlywayAppliedMigrations() { return flywayAppliedMigrations; }
    public void setFlywayAppliedMigrations(int flywayAppliedMigrations) { this.flywayAppliedMigrations = flywayAppliedMigrations; }

    public String getFlywayStatus() { return flywayStatus; }
    public void setFlywayStatus(String flywayStatus) { this.flywayStatus = flywayStatus; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
