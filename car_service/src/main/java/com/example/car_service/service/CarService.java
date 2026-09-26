package com.example.car_service.service;

import com.example.car_service.domain.dto.car.CarCreateRequest;
import com.example.car_service.domain.dto.car.CarResponse;
import com.example.car_service.domain.dto.car.CarUpdateRequest;

import java.util.UUID;

public interface CarService {

    CarResponse create(CarCreateRequest request);

    CarResponse findById(UUID id);

    CarResponse updateCarById(UUID id, CarUpdateRequest request);

    void hardDeleteCarById(UUID id);

    void softDeleteCarById(UUID id);
}
