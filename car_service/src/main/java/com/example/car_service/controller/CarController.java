package com.example.car_service.controller;

import com.example.car_service.domain.dto.car.*;
import com.example.car_service.service.CarService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cars")
public class CarController {

    private final CarService carService;

    @PostMapping
    public ResponseEntity<CarResponse> createCar(
            @Valid @RequestBody CarCreateRequest request
    ) {
        CarResponse carResponse = carService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(carResponse);
    }

    @GetMapping
    public ResponseEntity<CarPageResponse> findCarsWithFilter(
            @Valid @ModelAttribute CarSearchRequest searchRequest
    ) {

        CarPageResponse carPageResponse = carService.findWithFilter(searchRequest);

        return ResponseEntity.ok(carPageResponse);

    }

    @GetMapping("/{id}")
    public ResponseEntity<CarResponse> getCarById(
            @PathVariable UUID id
    ) {
        CarResponse carResponse = carService.findById(id);

        return ResponseEntity.ok(carResponse);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CarResponse> updateCarById(
            @PathVariable UUID id,
            @Valid @RequestBody CarUpdateRequest updateRequest
    ) {

        CarResponse carResponse = carService.updateCarById(id, updateRequest);

        return ResponseEntity.ok(carResponse);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(
            @PathVariable UUID id
    ) {

        carService.softDeleteCarById(id);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @DeleteMapping("/{id}/admin")
    public ResponseEntity<Void> hardDeleteById(
            @PathVariable UUID id
    ) {

        carService.hardDeleteCarById(id);

        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<Void> restoreCarById(
            @PathVariable UUID id
    ) {
        carService.restoreCarById(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
