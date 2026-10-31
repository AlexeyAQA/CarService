package com.example.car_service.service;

import com.example.car_service.domain.dto.maintenance.MaintenanceRecordCreateRequest;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordSearchRequest;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordPageResponse;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordResponse;

import java.util.UUID;

public interface MaintenanceService {

    MaintenanceRecordResponse create(UUID carId, MaintenanceRecordCreateRequest request);

    MaintenanceRecordResponse findRecordById(UUID carId, UUID recordId);

    MaintenanceRecordPageResponse findAllRecordsByCarId(UUID carId, MaintenanceRecordSearchRequest request);

}
