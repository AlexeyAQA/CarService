package com.example.car_service.domain.dto.owner;

import org.springframework.http.HttpStatus;

public record ErrorDto(

        int statusCode,

        String message

) {
}
