package com.example.car_service.domain.dto.owner;

import com.example.car_service.domain.dto.car.CarResponse;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Builder
public record OwnerResponse(

        UUID id,

        String fullName,

        String phone,

        String email,

        List<CarResponse> cars,

        @JsonFormat(pattern = "HH:mm - dd.MM.yyyy")
        ZonedDateTime createdAt,

        @JsonFormat(pattern = "HH:mm - dd.MM.yyyy")
        ZonedDateTime updatedAt

) {
}
