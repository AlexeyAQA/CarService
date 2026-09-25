package com.example.car_service.repository;

import com.example.car_service.domain.entity.CarEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface CarRepository extends JpaRepository<CarEntity, UUID>, JpaSpecificationExecutor<CarEntity> {

    Optional<CarEntity> findByIdAndDeletedAtIsNull(UUID id);

    boolean existsByVinIgnoreCase(String vin);

}
