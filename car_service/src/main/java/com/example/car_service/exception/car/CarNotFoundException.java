package com.example.car_service.exception.car;

import java.util.UUID;

public class CarNotFoundException extends RuntimeException {
    public CarNotFoundException(UUID id) {
        super("Автомобиль с ID " + id + " не найден");
    }
}
