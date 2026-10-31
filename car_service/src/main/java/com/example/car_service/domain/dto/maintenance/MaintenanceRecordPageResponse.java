package com.example.car_service.domain.dto.maintenance;

import java.util.List;

public record MaintenanceRecordPageResponse(
        List<MaintenanceRecordResponse> records,

        int page,

        int size,

        long totalElements,

        int totalPages
) {
}
