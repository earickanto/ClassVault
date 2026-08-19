package com.classvault.api;

import com.classvault.api.entity.enums.FileType;
import com.classvault.api.exception.FileValidationException;
import com.classvault.api.service.FileService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class FileValidationTest {

    @Autowired
    private FileService fileService;

    @Test
    @DisplayName("Video file exceeding 10MB limit MUST be rejected")
    void testVideoExceedingLimitRejected() {
        // 11 MB fake video
        byte[] oversizedBytes = new byte[11 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile("file", "demo.mp4", "video/mp4", oversizedBytes);

        assertThrows(FileValidationException.class, () -> {
            fileService.validateFile(file, FileType.VIDEO);
        });
    }

    @Test
    @DisplayName("ZIP source code exceeding 100MB limit MUST be rejected")
    void testZipExceedingLimitRejected() {
        // 101 MB fake zip
        byte[] oversizedBytes = new byte[101 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile("file", "source.zip", "application/zip", oversizedBytes);

        assertThrows(FileValidationException.class, () -> {
            fileService.validateFile(file, FileType.ZIP);
        });
    }

    @Test
    @DisplayName("PDF report exceeding 20MB limit MUST be rejected")
    void testPdfExceedingLimitRejected() {
        // 21 MB fake pdf
        byte[] oversizedBytes = new byte[21 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile("file", "report.pdf", "application/pdf", oversizedBytes);

        assertThrows(FileValidationException.class, () -> {
            fileService.validateFile(file, FileType.PDF);
        });
    }

    @Test
    @DisplayName("Empty file upload MUST be rejected")
    void testEmptyFileRejected() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.zip", "application/zip", new byte[0]);

        assertThrows(FileValidationException.class, () -> {
            fileService.storeFile(emptyFile, FileType.ZIP, "test");
        });
    }
}
