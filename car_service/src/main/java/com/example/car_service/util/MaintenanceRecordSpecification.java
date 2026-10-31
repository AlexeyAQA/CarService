package com.example.car_service.util;

import com.example.car_service.domain.dto.maintenance.MaintenanceRecordSearchRequest;
import com.example.car_service.domain.entity.MaintenanceItemEntity;
import com.example.car_service.domain.entity.MaintenanceRecordEntity;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

public class MaintenanceRecordSpecification {

    public static Specification<MaintenanceRecordEntity> forCar(
            UUID carId, MaintenanceRecordSearchRequest request
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("car").get("id"), carId));
            predicates.add(cb.isNull(root.get("car").get("deletedAt")));

            if (request.dateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("serviceDate"), request.dateFrom()));
            }
            if (request.dateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("serviceDate"), request.dateTo()));
            }
            if (request.performerType() != null) {
                predicates.add(cb.equal(root.get("performerType"), request.performerType()));
            }
            if (request.serviceCenterId() != null) {
                predicates.add(cb.equal(root.get("serviceCenter").get("id"), request.serviceCenterId()));
            }
            if (request.q() != null) {
                String pattern = containsPattern(request.q());

                // EXISTS keeps each record unique even when several of its items match.
                Subquery<Integer> matchingItems = query.subquery(Integer.class);
                Root<MaintenanceItemEntity> item = matchingItems.from(MaintenanceItemEntity.class);
                matchingItems.select(cb.literal(1)).where(
                        cb.equal(item.get("maintenanceRecord").get("id"), root.get("id")),
                        cb.or(
                                cb.like(cb.lower(item.get("name")), pattern, '\\'),
                                cb.like(cb.lower(item.get("partNumber")), pattern, '\\')
                        )
                );
                predicates.add(cb.exists(matchingItems));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static String containsPattern(String value) {
        String escaped = value.toLowerCase(Locale.ROOT)
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
        return "%" + escaped + "%";
    }
}
