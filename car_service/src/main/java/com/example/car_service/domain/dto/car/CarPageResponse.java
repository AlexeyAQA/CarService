package com.example.car_service.domain.dto.car;

import java.util.List;

public record CarPageResponse(
        List<CarResponse> cars,

        int page,

        int size,

        long totalElements,

        int totalPages
) {
}
