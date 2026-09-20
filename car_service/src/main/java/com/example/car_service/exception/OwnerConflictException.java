package com.example.car_service.exception;

public class OwnerConflictException extends RuntimeException {
    public OwnerConflictException(String message) {
        super(message);
    }
}
