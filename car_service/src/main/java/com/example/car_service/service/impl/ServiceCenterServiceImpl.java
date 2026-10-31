package com.example.car_service.service.impl;

import com.example.car_service.domain.dto.servicecenter.ServiceCenterCreateRequest;
import com.example.car_service.domain.dto.servicecenter.ServiceCenterResponse;
import com.example.car_service.domain.entity.ServiceCenterEntity;
import com.example.car_service.mapper.ServiceCenterMapper;
import com.example.car_service.repository.ServiceCenterRepository;
import com.example.car_service.service.ServiceCenterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceCenterServiceImpl implements ServiceCenterService {

    private final ServiceCenterMapper mapper;
    private final ServiceCenterRepository repository;

    @Override
    @Transactional
    public ServiceCenterResponse create(ServiceCenterCreateRequest request) {

        String formattedPhone = request.phone();

        if (formattedPhone != null) {
            formattedPhone = formattedPhone.strip();
            formattedPhone = formattedPhone.isEmpty() ? null : formattedPhone;
        }

        ServiceCenterEntity serviceCenter = ServiceCenterEntity.builder()
                .name(request.name().strip())
                .address(request.address().strip())
                .phone(formattedPhone)
                .build();

        serviceCenter = repository.saveAndFlush(serviceCenter);

        return mapper.toDto(serviceCenter);
    }

    @Override
    public List<ServiceCenterResponse> findAll() {

        return repository.findAll().stream().map(mapper::toDto).toList();

    }
}
