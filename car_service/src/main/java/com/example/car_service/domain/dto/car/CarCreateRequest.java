package com.example.car_service.domain.dto.car;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record CarCreateRequest(

        @NotBlank(message = "VIN is required")
        @Pattern(
                regexp = "(?i)^[A-HJ-NPR-Z0-9]{17}$",
                message = "VIN must contain exactly 17 letters or digits and must not contain I, O, or Q"
        )
        String vin,

        @Pattern(
                regexp = "(?s).*\\S.*",
                message = "Registration number must not be blank"
        )
        @Size(max = 20, message = "Registration number must not exceed 20 characters")
        String regNumber,

        @NotNull(message = "Year is required")
        @Min(value = 1886, message = "Year cannot be earlier than 1886")
        Integer year,

        @NotNull(message = "Mileage is required")
        @PositiveOrZero(message = "Mileage must be zero or greater")
        Integer mileage,

        @NotBlank(message = "Manufacturer is required")
        @Size(max = 100, message = "Manufacturer must not exceed 100 characters")
        String manufacturer,

        @NotBlank(message = "Model is required")
        @Size(max = 100, message = "Model must not exceed 100 characters")
        String model,

        @NotNull(message = "Owner ID is required")
        UUID ownerId

) {
}
