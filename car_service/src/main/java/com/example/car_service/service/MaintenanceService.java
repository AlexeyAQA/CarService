package com.example.car_service.service;

import com.example.car_service.domain.dto.maintenance.MaintenanceRecordCreateRequest;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordResponse;

import java.util.UUID;

public interface MaintenanceService {

    MaintenanceRecordResponse create(UUID carId, MaintenanceRecordCreateRequest request);

}
