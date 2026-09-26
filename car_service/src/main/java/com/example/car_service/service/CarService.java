package com.example.car_service.service;

import com.example.car_service.domain.dto.car.CarCreateRequest;
import com.example.car_service.domain.dto.car.CarResponse;

import java.util.UUID;

public interface CarService {

    CarResponse create(CarCreateRequest request);

    CarResponse findById(UUID id);

}
