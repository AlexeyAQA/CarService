package com.example.car_service.repository;

import com.example.car_service.domain.entity.ServiceCenterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ServiceCenterRepository extends JpaRepository<ServiceCenterEntity, UUID> {
}
