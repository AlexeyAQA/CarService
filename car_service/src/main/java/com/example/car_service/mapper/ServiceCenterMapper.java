package com.example.car_service.mapper;

import com.example.car_service.domain.dto.servicecenter.ServiceCenterCreateRequest;
import com.example.car_service.domain.dto.servicecenter.ServiceCenterResponse;
import com.example.car_service.domain.entity.ServiceCenterEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ServiceCenterMapper {

    ServiceCenterResponse toDto(ServiceCenterEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ServiceCenterEntity toEntity(ServiceCenterCreateRequest request);
}
