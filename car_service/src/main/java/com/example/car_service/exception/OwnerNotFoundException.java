package com.example.car_service.exception;

import java.util.UUID;

public class OwnerNotFoundException extends RuntimeException {

    public OwnerNotFoundException(UUID id) {
        super("Owner with provided id: " + id + " not found");
    }
}
