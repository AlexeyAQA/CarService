package com.example.car_service.domain.dto.maintenance;

import com.example.car_service.domain.enums.PerformerType;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.UUID;

public record MaintenanceRecordSearchRequest(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate dateFrom,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate dateTo,

        PerformerType performerType,

        UUID serviceCenterId,

        @Size(max = 255, message = "Search text must not exceed 255 characters")
        String q,

        @Min(value = 0, message = "Page must be zero or greater")
        Integer page,

        @Min(value = 1, message = "Size must be at least 1")
        @Max(value = 100, message = "Size must not exceed 100")
        Integer size
) {
    public MaintenanceRecordSearchRequest {
        q = q == null || q.isBlank() ? null : q.strip();
        page = page == null ? 0 : page;
        size = size == null ? 5 : size;
    }

    @AssertTrue(message = "Date from must not be after date to")
    public boolean isDateRangeValid() {
        return dateFrom == null || dateTo == null || !dateFrom.isAfter(dateTo);
    }

    @AssertTrue(message = "Service center cannot be specified for self-performed maintenance")
    public boolean isPerformerFilterValid() {
        return performerType != PerformerType.SELF || serviceCenterId == null;
    }
}
