package com.example.car_service.exception.car;

public class CarConflictException extends RuntimeException {
    public CarConflictException(String message) {
        super(message);
    }
}
