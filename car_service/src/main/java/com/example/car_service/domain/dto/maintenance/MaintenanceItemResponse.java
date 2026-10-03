package com.example.car_service.domain.dto.maintenance;

import com.example.car_service.domain.enums.MaintenanceItemType;

import java.math.BigDecimal;
import java.util.UUID;

public record MaintenanceItemResponse(

        UUID id,

        String name,

        MaintenanceItemType type,

        BigDecimal amount,

        String partNumber,

        Integer position

) {
}
