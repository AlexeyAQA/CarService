package com.example.car_service.domain.dto.car;

import java.time.ZonedDateTime;
import java.util.UUID;

public record CarResponse(
        UUID id,
        String vin,
        String regNumber,
        Integer year,
        Integer mileage,
        String manufacturer,
        String model,
        UUID ownerId,
        ZonedDateTime createdAt,
        ZonedDateTime updatedAt
) {
}
