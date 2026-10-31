package com.example.car_service.controller;

import com.example.car_service.domain.dto.maintenance.MaintenanceRecordCreateRequest;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordSearchRequest;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordPageResponse;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordResponse;
import com.example.car_service.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cars/{carId}/maintenance-records")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @PostMapping
    public ResponseEntity<MaintenanceRecordResponse> addMaintenanceRecordToCar(
            @PathVariable UUID carId,
            @Valid @RequestBody MaintenanceRecordCreateRequest request
    ) {

        MaintenanceRecordResponse maintenanceRecordResponse = maintenanceService.create(carId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceRecordResponse);
    }

    @GetMapping
    public ResponseEntity<MaintenanceRecordPageResponse> findAllMaintenanceRecordsByCarId(
            @PathVariable UUID carId,
            @Valid @ModelAttribute MaintenanceRecordSearchRequest request
    ) {
        MaintenanceRecordPageResponse response = maintenanceService.findAllRecordsByCarId(carId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{recordId}")
    public ResponseEntity<MaintenanceRecordResponse> findMaintenanceRecordById(
            @PathVariable UUID carId,
            @PathVariable UUID recordId
    ) {

        MaintenanceRecordResponse maintenanceRecordResponse = maintenanceService.findRecordById(carId, recordId);

        return ResponseEntity.status(HttpStatus.OK).body(maintenanceRecordResponse);

    }

}
