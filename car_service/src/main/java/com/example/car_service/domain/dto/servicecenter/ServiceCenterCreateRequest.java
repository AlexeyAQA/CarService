package com.example.car_service.domain.dto.servicecenter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ServiceCenterCreateRequest(
        @Size(max = 255, message = "Name must not exceed 255 characters")
        @NotBlank(message = "Name is required")
        String name,

        @Size(max = 255, message = "Address must not exceed 255 characters")
        @NotBlank(message = "Address is required")
        String address,

        @Size(max = 255, message = "Phone must not exceed 255 characters")
        String phone

) {
}
