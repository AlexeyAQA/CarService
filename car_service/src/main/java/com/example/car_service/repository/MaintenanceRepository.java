package com.example.car_service.repository;

import com.example.car_service.domain.entity.MaintenanceRecordEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface MaintenanceRepository extends JpaRepository<MaintenanceRecordEntity, UUID>,
        JpaSpecificationExecutor<MaintenanceRecordEntity> {

    Optional<MaintenanceRecordEntity> findByIdAndCar_Id(UUID uuid, UUID carId);

    Page<MaintenanceRecordEntity> findAllByCar_Id(UUID carId, Pageable pageable);
}
