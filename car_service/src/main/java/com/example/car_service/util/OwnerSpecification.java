package com.example.car_service.util;

import com.example.car_service.domain.entity.OwnerEntity;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class OwnerSpecification {

    public static Specification<OwnerEntity> ownerSpecification(

            String fullName,

            List<String> owners,

            String phone,

            String email,

            LocalDate createdFrom,

            LocalDate createdTo,

            LocalDate updatedFrom,

            LocalDate updatedTo
    ) {

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.isNull(root.get("deletedAt")));

            if (fullName != null && !fullName.isBlank()) {
                String namePattern = fullName.strip().toLowerCase(Locale.ROOT)
                        .replace("\\", "\\\\")
                        .replace("%", "\\%")
                        .replace("_", "\\_");
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("fullName")), "%" + namePattern + "%", '\\'));
            }

            if (owners != null && !owners.isEmpty()) {
                predicates.add(root.get("fullName").in(owners));
            }

            if (phone != null) {
                predicates.add(criteriaBuilder.equal(root.get("phone"), phone));
            }

            if (email != null) {
                predicates.add(criteriaBuilder.equal(root.get("email"), email));
            }

            // Date filters use calendar days in the server's time zone.
            ZoneId zone = ZoneId.systemDefault();
            addDateRange(predicates, criteriaBuilder, root.get("recordCreatedAt"), createdFrom, createdTo, zone);
            addDateRange(predicates, criteriaBuilder, root.get("recordUpdatedAt"), updatedFrom, updatedTo, zone);

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));

        };

    }

    private static void addDateRange(
            List<Predicate> predicates,
            CriteriaBuilder criteriaBuilder,
            Path<ZonedDateTime> field,
            LocalDate from,
            LocalDate to,
            ZoneId zone
    ) {
        if (from != null) {
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(field, from.atStartOfDay(zone)));
        }
        if (to != null) {
            predicates.add(criteriaBuilder.lessThan(field, to.plusDays(1).atStartOfDay(zone)));
        }
    }
}
