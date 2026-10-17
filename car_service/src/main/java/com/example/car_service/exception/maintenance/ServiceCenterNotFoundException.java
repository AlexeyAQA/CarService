package com.example.car_service.exception.maintenance;

import java.util.UUID;

public class ServiceCenterNotFoundException extends RuntimeException {
    public ServiceCenterNotFoundException(UUID uuid) {
        super("Сервисный центр с ID " + uuid + " не найден");
    }
}
