package com.example.car_service.domain.dto.owner;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;
import java.util.List;

public record OwnerSearchRequest(

        String fullName,

        List<String> owners,


        @Pattern(
                regexp = "^7\\d{10}$",
                message = "Phone must start with 7 and contain 11 digits"
        )
        String phone,


        @Email(
                message = "Email has invalid format")
        @Pattern(
                regexp = ".*\\S.*",
                message = "Email must not be blank"
        )
        String email,

        @PastOrPresent(
                message = "Created from must not be in the future")
        LocalDate createdFrom,

        @PastOrPresent(
                message = "CreatedTo must not be in the future")
        LocalDate createdTo,

        @PastOrPresent(
                message = "Updated from must not be in the future")
        LocalDate updatedFrom,

        @PastOrPresent(
                message = "Updated to must not be in the future")
        LocalDate updatedTo,

        Integer page,

        Integer size,

        @Pattern(
                regexp = "^(fullName|phone|email|updatedAt)$",
                message = "Unsupported sorting field"
        )
        String sortBy,

        @Pattern(
                regexp = "(?i)^(asc|desc)$",
                message = "Direction must be asc or desc"
        )
        String direction

) {

        public OwnerSearchRequest {
                page = page == null || page < 0 ? 0 : page;
                size = size == null || size < 1 || size > 100 ? 20 : size;
                sortBy = sortBy == null || sortBy.isBlank() ? "fullName" : sortBy;
                direction = direction == null || direction.isBlank() ? "asc" : direction;
        }
}
