package com.classvault.api.exception;

public class BadCredentialsApiException extends RuntimeException {
    public BadCredentialsApiException(String message) {
        super(message);
    }
}
