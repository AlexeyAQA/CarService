package com.example.car_service.service;

import com.example.car_service.domain.dto.servicecenter.ServiceCenterCreateRequest;
import com.example.car_service.domain.dto.servicecenter.ServiceCenterResponse;

import java.util.List;

public interface ServiceCenterService {

    ServiceCenterResponse create(ServiceCenterCreateRequest request);

    List<ServiceCenterResponse> findAll();

}
