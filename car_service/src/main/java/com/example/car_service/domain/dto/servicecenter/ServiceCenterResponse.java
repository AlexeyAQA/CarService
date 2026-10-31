package com.example.car_service.domain.dto.servicecenter;

import java.util.UUID;

public record ServiceCenterResponse(
        UUID id,

        String name,

        String address,

        String phone

) {
}
