package com.example.car_service.mapper;

import com.example.car_service.domain.dto.car.CarCreateRequest;
import com.example.car_service.domain.dto.car.CarResponse;
import com.example.car_service.domain.dto.car.CarSummaryResponse;
import com.example.car_service.domain.dto.car.CarUpdateRequest;
import com.example.car_service.domain.entity.CarEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface CarMapper {

    @Mapping(target = "ownerId", source = "owner.id")
    CarResponse toDto(CarEntity entity);

    CarSummaryResponse toSummaryDto(CarEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    CarEntity toEntity(CarCreateRequest request);

    @BeanMapping(
            nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "vin", ignore = true)
    @Mapping(target = "owner", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateEntity(
            CarUpdateRequest request,
            @MappingTarget CarEntity entity
    );
}
