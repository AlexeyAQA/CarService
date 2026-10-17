package com.example.car_service.service.impl;

import com.example.car_service.domain.dto.maintenance.MaintenanceRecordCreateRequest;
import com.example.car_service.domain.dto.maintenance.MaintenanceRecordResponse;
import com.example.car_service.domain.entity.CarEntity;
import com.example.car_service.domain.entity.MaintenanceItemEntity;
import com.example.car_service.domain.entity.MaintenanceRecordEntity;
import com.example.car_service.domain.entity.ServiceCenterEntity;
import com.example.car_service.domain.enums.PerformerType;
import com.example.car_service.exception.car.CarNotFoundException;
import com.example.car_service.exception.maintenance.ServiceCenterNotFoundException;
import com.example.car_service.mapper.MaintenanceItemMapper;
import com.example.car_service.mapper.MaintenanceRecordMapper;
import com.example.car_service.repository.CarRepository;
import com.example.car_service.repository.MaintenanceRepository;
import com.example.car_service.repository.ServiceCenterRepository;
import com.example.car_service.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceServiceImpl implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final MaintenanceItemMapper maintenanceItemMapper;
    private final ServiceCenterRepository serviceCenterRepository;
    private final CarRepository carRepository;

    private final MaintenanceRecordMapper maintenanceRecordMapper;

    @Override
    @Transactional
    public MaintenanceRecordResponse create(UUID carId, MaintenanceRecordCreateRequest request) {

        CarEntity car = carRepository.findByIdAndDeletedAtIsNull(carId)
                .orElseThrow(
                        ()-> new CarNotFoundException(carId)
                );

        ServiceCenterEntity serviceCenter = null;

        if (request.performerType() == PerformerType.SERVICE_CENTER) {
           serviceCenter = serviceCenterRepository.findById(request.serviceCenterId())
                    .orElseThrow(
                            ()-> new ServiceCenterNotFoundException(request.serviceCenterId())
                    );
        }

        List<MaintenanceItemEntity> itemEntities = new ArrayList<>();

        BigDecimal totalSum = BigDecimal.ZERO;

        for (int i = 0; i < request.items().size(); i++){
            itemEntities.add(maintenanceItemMapper.toEntity(request.items().get(i)));

            totalSum = totalSum.add(request.items().get(i).amount());
        }

        MaintenanceRecordEntity maintenanceRecord = MaintenanceRecordEntity.builder()
                .car(car)
                .serviceCenter(serviceCenter)
                .items(itemEntities)
                .serviceDate(request.serviceDate())
                .mileage(request.mileage())
                .performerType(request.performerType())
                .description(request.description())
                .build();

        for (int i = 0; i < maintenanceRecord.getItems().size(); i++) {
            MaintenanceItemEntity maintenanceItem = maintenanceRecord.getItems().get(i);

            if (maintenanceItem.getPartNumber() != null
                    && !maintenanceItem.getPartNumber().isBlank()) {
               String normalizedPartNumber =  maintenanceItem.getPartNumber().strip();
               maintenanceItem.setPartNumber(normalizedPartNumber);
            } else {
                maintenanceItem.setPartNumber(null);
            }


            maintenanceItem.setPosition(i);
            maintenanceItem.setMaintenanceRecord(maintenanceRecord);
        }

        maintenanceRecord = maintenanceRepository.saveAndFlush(maintenanceRecord);


        return maintenanceRecordMapper.toDto(maintenanceRecord, totalSum);
    }
}
