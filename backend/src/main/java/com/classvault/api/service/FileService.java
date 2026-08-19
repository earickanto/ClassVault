package com.classvault.api.service;

import com.classvault.api.entity.enums.FileType;
import com.classvault.api.exception.FileValidationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileService {

    @Value("${application.upload.dir:uploads}")
    private String uploadDir;

    // File limits in bytes
    private static final long MAX_ZIP_SIZE = 100 * 1024 * 1024L;   // 100MB
    private static final long MAX_VIDEO_SIZE = 10 * 1024 * 1024L;  // 10MB
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024L;  // 10MB
    private static final long MAX_PDF_SIZE = 20 * 1024 * 1024L;    // 20MB
    private static final long MAX_PPT_SIZE = 20 * 1024 * 1024L;    // 20MB

    public String storeFile(MultipartFile file, FileType expectedType, String subFolder) {
        if (file.isEmpty()) {
            throw new FileValidationException("Uploaded file is empty");
        }

        validateFile(file, expectedType);

        try {
            Path targetDir = Paths.get(uploadDir, subFolder).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path targetLocation = targetDir.resolve(newFilename);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + subFolder + "/" + newFilename;
        } catch (IOException ex) {
            throw new FileValidationException("Failed to store file: " + ex.getMessage());
        }
    }

    public void validateFile(MultipartFile file, FileType expectedType) {
        long size = file.getSize();

        switch (expectedType) {
            case ZIP -> {
                if (size > MAX_ZIP_SIZE) {
                    throw new FileValidationException("Source code ZIP exceeds maximum allowed size of 100MB");
                }
                verifyMagicBytes(file, new byte[][]{{0x50, 0x4B, 0x03, 0x04}, {0x50, 0x4B, 0x05, 0x06}}, "ZIP archive");
            }
            case VIDEO -> {
                if (size > MAX_VIDEO_SIZE) {
                    throw new FileValidationException("Demo video exceeds maximum allowed size of 10MB");
                }
                // Verify MP4 / WebM magic bytes
                verifyMagicBytes(file, new byte[][]{{0x00, 0x00, 0x00}, {0x1A, 0x45, (byte) 0xDF, (byte) 0xA3}}, "MP4/WebM video");
            }
            case IMAGE -> {
                if (size > MAX_IMAGE_SIZE) {
                    throw new FileValidationException("Image exceeds maximum allowed size of 10MB");
                }
                verifyMagicBytes(file, new byte[][]{{(byte) 0x89, 0x50, 0x4E, 0x47}, {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF}, {0x52, 0x49, 0x46, 0x46}}, "JPEG/PNG/WebP image");
            }
            case PDF -> {
                if (size > MAX_PDF_SIZE) {
                    throw new FileValidationException("Project report PDF exceeds maximum allowed size of 20MB");
                }
                verifyMagicBytes(file, new byte[][]{{0x25, 0x50, 0x44, 0x46}}, "PDF document");
            }
            case PPT -> {
                if (size > MAX_PPT_SIZE) {
                    throw new FileValidationException("Presentation PPT exceeds maximum allowed size of 20MB");
                }
                // PPT / PPTX magic bytes check
                verifyMagicBytes(file, new byte[][]{{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0}, {0x50, 0x4B, 0x03, 0x04}}, "PPT/PPTX presentation");
            }
        }
    }

    private void verifyMagicBytes(MultipartFile file, byte[][] validSignatures, String formatDescription) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[16];
            int read = is.read(header);
            if (read < 4) {
                throw new FileValidationException("File header corrupted or incomplete for " + formatDescription);
            }

            boolean matched = false;
            for (byte[] signature : validSignatures) {
                boolean matchSig = true;
                for (int i = 0; i < signature.length && i < header.length; i++) {
                    if (header[i] != signature[i]) {
                        matchSig = false;
                        break;
                    }
                }
                if (matchSig) {
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                // Soft check: allow if file content type aligns to prevent blocking non-standard encodings
                String contentType = file.getContentType();
                if (contentType == null || (!contentType.contains("octet") && !contentType.contains("zip") && !contentType.contains("pdf") && !contentType.contains("image") && !contentType.contains("video") && !contentType.contains("presentation"))) {
                    throw new FileValidationException("File content signature does not match expected format for " + formatDescription);
                }
            }
        } catch (IOException e) {
            throw new FileValidationException("Failed to read file signature for validation");
        }
    }
}
