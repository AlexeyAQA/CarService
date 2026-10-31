package com.example.car_service.controller;

import com.example.car_service.domain.dto.servicecenter.ServiceCenterCreateRequest;
import com.example.car_service.domain.dto.servicecenter.ServiceCenterResponse;
import com.example.car_service.service.ServiceCenterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/service-centers")
public class ServiceCenterController {

    private final ServiceCenterService centerService;

    @PostMapping
    public ResponseEntity<ServiceCenterResponse> createServiceCenter(
            @Valid @RequestBody ServiceCenterCreateRequest request
    ) {
        ServiceCenterResponse response = centerService.create(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ServiceCenterResponse>> findAllServiceCenters() {

        List<ServiceCenterResponse> response = centerService.findAll();

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
