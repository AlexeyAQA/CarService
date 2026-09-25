package com.example.car_service.exception.car;

import java.util.UUID;

public class CarNotFoundException extends RuntimeException {
    public CarNotFoundException(UUID id) {
        super("Car with provided id: " + id + " not found");
    }
}
