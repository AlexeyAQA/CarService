package com.example.car_service.domain.dto.car;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record CarUpdateRequest(

        @Pattern(
                regexp = "(?s).*\\S.*",
                message = "Registration number must not be blank"
        )
        @Size(max = 20, message = "Registration number must not exceed 20 characters")
        String regNumber,

        @Min(value = 1886, message = "Year cannot be earlier than 1886")
        Integer year,

        @PositiveOrZero(message = "Mileage must be zero or greater")
        Integer mileage,

        @Pattern(
                regexp = "(?s).*\\S.*",
                message = "Model must not be blank"
        )
        @Size(max = 100, message = "Manufacturer must not exceed 100 characters")
        String manufacturer,

        @Pattern(
                regexp = "(?s).*\\S.*",
                message = "Manufacturer must not be blank"
        )
        @Size(max = 100, message = "Model must not exceed 100 characters")
        String model,

        UUID ownerId
) {
    @AssertTrue(message = "At least one field must be provided")
    public boolean isAnyFieldProvided() {
        return regNumber != null
                || year != null
                || mileage != null
                || manufacturer != null
                || model != null
                || ownerId != null;
    }
}
