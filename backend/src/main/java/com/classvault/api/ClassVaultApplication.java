package com.classvault.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class ClassVaultApplication {

    public static void main(String[] args) {
        loadEnvironmentVariables();
        SpringApplication.run(ClassVaultApplication.class, args);
    }

    /**
     * Safely reads environment variables from a local .env file if present
     * and populates system properties without overriding existing environment variables.
     */
    private static void loadEnvironmentVariables() {
        File[] possibleEnvFiles = {
            new File(".env"),
            new File("../.env"),
            new File("backend/.env")
        };

        for (File envFile : possibleEnvFiles) {
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            // Strip surrounding double/single quotes if present
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getenv(key) == null && System.getProperty(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (IOException e) {
                    System.err.println("Notice: Could not load .env file: " + e.getMessage());
                }
                break; // Found and loaded closest .env
            }
        }
    }
}
