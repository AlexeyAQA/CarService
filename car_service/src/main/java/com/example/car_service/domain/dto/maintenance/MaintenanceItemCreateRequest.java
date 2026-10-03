package com.example.car_service.domain.dto.maintenance;

import com.example.car_service.domain.enums.MaintenanceItemType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record MaintenanceItemCreateRequest(

        @NotBlank
        @Size(max = 255)
        String name,

        @NotNull
        MaintenanceItemType type,

        @NotNull
        @PositiveOrZero
        @Digits(integer = 17, fraction = 2)
        BigDecimal amount,

        @Size(max = 100)
        String partNumber
) {
    @AssertTrue(message = "Part number is only allowed for PART items")
    public boolean isPartNumberValid() {
        return type == MaintenanceItemType.PART
                || partNumber == null
                || partNumber.isBlank();
    }
}
