package com.example.car_service.exception.owner;

import java.util.UUID;

public class OwnerNotFoundException extends RuntimeException {

    public OwnerNotFoundException(UUID id) {
        super("Владелец с ID " + id + " не найден");
    }
}
