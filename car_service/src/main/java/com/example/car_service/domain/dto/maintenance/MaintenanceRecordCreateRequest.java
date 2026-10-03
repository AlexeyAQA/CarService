package com.example.car_service.domain.dto.maintenance;

import com.example.car_service.domain.enums.PerformerType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record MaintenanceRecordCreateRequest(

        @NotNull
        @PastOrPresent
        LocalDate serviceDate,

        @NotNull
        @PositiveOrZero
        Integer mileage,

        @NotNull
        PerformerType performerType,

        @Size(max = 255)
        String description,

        @NotEmpty
        @Valid
        List<@NotNull MaintenanceItemCreateRequest> items,

        UUID serviceCenterId
) {
    @AssertTrue(message = "Service center is required for SERVICE_CENTER and must be absent for SELF")
    public boolean isServiceCenterValid() {

        if (performerType == null) {
            return true;
        }
        return (performerType == PerformerType.SELF && serviceCenterId == null)
                || (performerType == PerformerType.SERVICE_CENTER && serviceCenterId != null);
    }

}
