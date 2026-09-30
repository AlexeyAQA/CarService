package com.example.car_service.domain.dto.car;

import java.util.UUID;

public record CarSummaryResponse(
        UUID id,
        String vin,
        String regNumber,
        String manufacturer,
        String model
) {
}
