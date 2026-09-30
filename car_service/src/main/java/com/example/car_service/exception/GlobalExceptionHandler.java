package com.example.car_service.exception;

import com.example.car_service.domain.dto.owner.ErrorDto;
import com.example.car_service.exception.car.CarBusinessException;
import com.example.car_service.exception.car.CarConflictException;
import com.example.car_service.exception.car.CarNotFoundException;
import com.example.car_service.exception.owner.OwnerBusinessException;
import com.example.car_service.exception.owner.OwnerConflictException;
import com.example.car_service.exception.owner.OwnerNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(OwnerNotFoundException.class)
    public ResponseEntity<ErrorDto> handleException(OwnerNotFoundException e) {
        ErrorDto dto = new ErrorDto(HttpStatus.NOT_FOUND.value(), e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(dto);
    }

    @ExceptionHandler(OwnerConflictException.class)
    public ResponseEntity<ErrorDto> handleException(OwnerConflictException e) {
        ErrorDto dto = new ErrorDto(HttpStatus.CONFLICT.value(), e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(dto);
    }

    @ExceptionHandler(OwnerBusinessException.class)
    public ResponseEntity<ErrorDto> handleException(OwnerBusinessException e) {

        ErrorDto dto = new ErrorDto(HttpStatus.INTERNAL_SERVER_ERROR.value(), e.getMessage());

        return ResponseEntity.status(dto.statusCode()).body(dto);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDto> handleException(MethodArgumentNotValidException e) {

        ErrorDto dto = new ErrorDto(HttpStatus.BAD_REQUEST.value(), e.getMessage());

        return ResponseEntity.status(dto.statusCode()).body(dto);
    }

    @ExceptionHandler(CarNotFoundException.class)
    public ResponseEntity<ErrorDto> handleException(CarNotFoundException e) {

        ErrorDto dto = new ErrorDto(HttpStatus.NOT_FOUND.value(), e.getMessage());

        return ResponseEntity.status(dto.statusCode()).body(dto);
    }

    @ExceptionHandler(CarConflictException.class)
    public ResponseEntity<ErrorDto> handleException(CarConflictException e) {

        ErrorDto dto = new ErrorDto(HttpStatus.CONFLICT.value(), e.getMessage());

        return ResponseEntity.status(dto.statusCode()).body(dto);
    }

    @ExceptionHandler(CarBusinessException.class)
    public ResponseEntity<ErrorDto> handleException(CarBusinessException e) {

        ErrorDto dto = new ErrorDto(HttpStatus.INTERNAL_SERVER_ERROR.value(), e.getMessage());

        return ResponseEntity.status(dto.statusCode()).body(dto);
    }

}
