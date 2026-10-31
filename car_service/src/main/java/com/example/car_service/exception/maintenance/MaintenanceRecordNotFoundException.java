package com.example.car_service.exception.maintenance;

import java.util.UUID;

public class MaintenanceRecordNotFoundException extends RuntimeException {

    public MaintenanceRecordNotFoundException(UUID uuid) {
        super("Сервисная запись с ID " + uuid + " не найдена"
        );
    }
}
