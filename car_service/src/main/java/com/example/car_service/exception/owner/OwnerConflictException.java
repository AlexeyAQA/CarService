package com.example.car_service.exception.owner;

public class OwnerConflictException extends RuntimeException {
    public OwnerConflictException(String message) {
        super(message);
    }
}
