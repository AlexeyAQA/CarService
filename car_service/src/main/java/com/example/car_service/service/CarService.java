package com.example.car_service.service;

import com.example.car_service.domain.dto.car.*;

import java.util.UUID;

public interface CarService {

    CarResponse create(CarCreateRequest request);

    CarResponse findById(UUID id);

    CarPageResponse findWithFilter(CarSearchRequest filter);

    CarResponse updateCarById(UUID id, CarUpdateRequest request);

    void hardDeleteCarById(UUID id);

    void softDeleteCarById(UUID id);
}
