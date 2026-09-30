package com.example.car_service.mapper;

import com.example.car_service.domain.dto.owner.OwnerResponse;
import com.example.car_service.domain.dto.owner.OwnerUpdateRequest;
import com.example.car_service.domain.entity.OwnerEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface OwnerMapper {

    @Mapping(target = "createdAt", source = "recordCreatedAt")
    @Mapping(target = "updatedAt", source = "recordUpdatedAt")
    OwnerResponse toDto(OwnerEntity entity);

    @BeanMapping(
            nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cars", ignore = true)
    @Mapping(target = "recordCreatedAt", ignore = true)
    @Mapping(target = "recordUpdatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateEntity(
            OwnerUpdateRequest request,
            @MappingTarget OwnerEntity entity
    );

}
