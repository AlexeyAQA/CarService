package com.example.car_service.domain.dto.car;

import jakarta.validation.constraints.*;

import java.util.UUID;

public record CarSearchRequest(

        @Pattern(
                regexp = "(?i)^[A-HJ-NPR-Z0-9]{17}$",
                message = "VIN must contain exactly 17 letters or digits and must not contain I, O, or Q"
        )
        String vin,

        @Pattern(
                regexp = "(?s).*\\S.*",
                message = "Registration number must not be blank"
        )
        @Size(
                max = 20,
                message = "Registration number must not exceed 20 characters"
        )
        String regNumber,

        @Pattern(
                regexp = "(?s).*\\S.*",
                message = "Manufacturer must not be blank"
        )
        String manufacturer,

        @Pattern(
                regexp = "(?s).*\\S.*",
                message = "Model must not be blank"
        )
        String model,

        UUID ownerId,


        @Min(
                value = 1886,
                message = "Year from cannot be earlier than 1886"
        )
        Integer yearFrom,

        @Min(
                value = 1886,
                message = "Year to cannot be earlier than 1886"
        )
        Integer yearTo,

        @PositiveOrZero(
                message = "Mileage from must be zero or greater"
        )
        Integer mileageFrom,

        @PositiveOrZero(
                message = "Mileage to must be zero or greater"
        )
        Integer mileageTo,


        @Min(value = 0, message = "Page must be zero or greater")
        Integer page,

        @Min(value = 1, message = "Size must be at least 1")
        @Max(value = 100, message = "Size must not exceed 100")
        Integer size,

        @Pattern(
                regexp = "^(vin|regNumber|year|mileage|manufacturer|model|createdAt|updatedAt)$",
                message = "Unsupported sorting field"
        )
        String sortBy,

        @Pattern(
                regexp = "(?i)^(asc|desc)$",
                message = "Direction must be asc or desc"
        )
        String direction

) {

        public CarSearchRequest {
                page = page == null ? 0 : page;
                size = size == null ? 20 : size;
                sortBy = sortBy == null ? "model" : sortBy;
                direction = direction == null ? "asc" : direction;
        }

        @AssertTrue(message = "Year from must not be greater than year to")
        public boolean isYearRangeValid() {
                return yearFrom == null
                        || yearTo == null
                        || yearFrom <= yearTo;
        }

        @AssertTrue(message = "Mileage from must not be greater than mileage to")
        public boolean isMileageRangeValid() {
                return mileageFrom == null
                        || mileageTo == null
                        || mileageFrom <= mileageTo;
        }

}
