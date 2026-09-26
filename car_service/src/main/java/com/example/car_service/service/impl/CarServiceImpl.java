package com.example.car_service.service.impl;

import com.example.car_service.domain.dto.car.CarCreateRequest;
import com.example.car_service.domain.dto.car.CarResponse;
import com.example.car_service.domain.entity.CarEntity;
import com.example.car_service.domain.entity.OwnerEntity;
import com.example.car_service.exception.car.CarBusinessException;
import com.example.car_service.exception.car.CarConflictException;
import com.example.car_service.exception.car.CarNotFoundException;
import com.example.car_service.exception.owner.OwnerNotFoundException;
import com.example.car_service.mapper.CarMapper;
import com.example.car_service.repository.CarRepository;
import com.example.car_service.repository.OwnerRepository;
import com.example.car_service.service.CarService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final OwnerRepository ownerRepository;

    @Override
    @Transactional
    public CarResponse create(CarCreateRequest request) {

        OwnerEntity owner = ownerRepository.findByIdAndDeletedAtIsNull(
                        request.ownerId())
                .orElseThrow(
                        () -> new OwnerNotFoundException(request.ownerId())
                );

        checkCarYearNotBiggerThanCurrent(request);

        CarEntity car = CarEntity.builder()
                .vin(request.vin().toUpperCase(Locale.ROOT))
                .regNumber(request.regNumber())
                .year(request.year())
                .mileage(request.mileage())
                .manufacturer(request.manufacturer())
                .model(request.model())
                .owner(owner)
                .build();

        try {
            if (carRepository.existsByVinIgnoreCase(request.vin())) {
                throw new CarConflictException("Переданный в запросе VIN уже существует в базе");
            }
            car = carRepository.saveAndFlush(car);

        } catch (DataAccessException e) {
            log.error("Не удалось сохранить автомобиль", e);
            throw new CarBusinessException("Ошибка взаимодействия с БД");
        }
        log.debug("Сущность создана: {}", car.getId());
        return carMapper.toDto(car);
    }



    @Override
    @Transactional(readOnly = true)
    public CarResponse findById(UUID id) {

        CarEntity car = getActiveCarEntityById(id);

        return carMapper.toDto(car);
    }

    private CarEntity getActiveCarEntityById(UUID id) {
        CarEntity car = carRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(()-> new CarNotFoundException(id));
        return car;
    }

    private static void checkCarYearNotBiggerThanCurrent(CarCreateRequest request) {
        if (request.year() > Year.now().getValue()) {
            throw new CarConflictException("Год выпуска авто не может быть больше текущего");
        }
    }

}
