package com.example.car_service.mapper;

import com.example.car_service.domain.dto.maintenance.MaintenanceItemCreateRequest;
import com.example.car_service.domain.dto.maintenance.MaintenanceItemResponse;
import com.example.car_service.domain.entity.MaintenanceItemEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface MaintenanceItemMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "maintenanceRecord", ignore = true)
    @Mapping(target = "position", ignore = true)
    MaintenanceItemEntity toEntity(MaintenanceItemCreateRequest request);

    MaintenanceItemResponse toDto(MaintenanceItemEntity entity);

}
