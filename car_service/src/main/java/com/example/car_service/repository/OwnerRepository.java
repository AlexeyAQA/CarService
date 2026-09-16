package com.example.car_service.repository;

import com.example.car_service.domain.entity.OwnerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OwnerRepository extends JpaRepository<OwnerEntity, UUID>, JpaSpecificationExecutor<OwnerEntity> {

    Optional<OwnerEntity> findByIdAndDeletedAtIsNull(UUID id);

    List<OwnerEntity> findByPhone(String phone);
}
