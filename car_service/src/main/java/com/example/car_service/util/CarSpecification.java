package com.example.car_service.util;

import com.example.car_service.domain.dto.car.CarSearchRequest;
import com.example.car_service.domain.entity.CarEntity;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import jakarta.persistence.criteria.Predicate;

public class CarSpecification {

    public static Specification<CarEntity> carSpecification(CarSearchRequest request) {

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isNull(root.get("deletedAt")));

            if (request.vin() != null) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.upper(root.get("vin")), request.vin().toUpperCase(Locale.ROOT)));
            }
            if (request.regNumber() != null) {
                predicates.add(criteriaBuilder.equal(root.get("regNumber"), request.regNumber()));
            }
            if (request.manufacturer() != null && !request.manufacturer().isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("manufacturer")),
                        containsPattern(request.manufacturer()), '\\'));
            }
            if (request.model() != null && !request.model().isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("model")),
                        containsPattern(request.model()), '\\'));
            }
            if (request.ownerId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("owner").get("id"), request.ownerId()));
            }
            if (request.yearFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("year"), request.yearFrom()));
            }
            if (request.yearTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("year"), request.yearTo()));
            }
            if (request.mileageFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("mileage"), request.mileageFrom()));
            }
            if (request.mileageTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("mileage"), request.mileageTo()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

    }

    private static String containsPattern(String value) {
        String escaped = value.strip().toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }
}
