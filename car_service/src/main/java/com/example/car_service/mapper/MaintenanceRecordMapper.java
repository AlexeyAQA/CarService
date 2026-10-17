package com.example.car_service.mapper;

import com.example.car_service.domain.dto.maintenance.MaintenanceRecordCreateRequest;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordResponse;
import com.example.car_service.domain.entity.MaintenanceRecordEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(
        componentModel = "spring",
        uses = MaintenanceItemMapper.class)
public interface MaintenanceRecordMapper {

    @Mapping(target = "carId", source = "entity.car.id")
    @Mapping(target = "serviceCenterId", source = "entity.serviceCenter.id")
    @Mapping(target = "totalAmount", source = "totalAmount")
    MaintenanceRecordResponse toDto(MaintenanceRecordEntity entity, BigDecimal totalAmount);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "car", ignore = true)
    @Mapping(target = "serviceCenter", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    MaintenanceRecordEntity toEntity(MaintenanceRecordCreateRequest request);

}
