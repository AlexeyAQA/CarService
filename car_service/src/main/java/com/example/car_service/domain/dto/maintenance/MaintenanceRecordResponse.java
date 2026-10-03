package com.example.car_service.domain.dto.maintenance;

import com.example.car_service.domain.enums.PerformerType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record MaintenanceRecordResponse(

        UUID id,

        UUID carId,

        LocalDate serviceDate,

        Integer mileage,

        PerformerType performerType,

        UUID serviceCenterId,

        String description,

        List<MaintenanceItemResponse> items,

        BigDecimal totalAmount,

        ZonedDateTime createdAt,

        ZonedDateTime updatedAt

) {
}
