package com.example.car_service.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "cars")
@Builder
public class CarEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "vin", nullable = false, unique = true)
    private String vin;

    @Column(name = "reg_number")
    private String regNumber;

    @Column(name = "production_year")
    private Integer year;

    @Column(name = "mileage", nullable = false)
    private Integer mileage;

    @Column(name = "manufacturer", nullable = false)
    private String manufacturer;

    @Column(name = "model", nullable = false)
    private String model;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private OwnerEntity owner;

    @OneToMany(mappedBy = "car", cascade = CascadeType.REMOVE)
    @Builder.Default
    private List<MaintenanceRecordEntity> services = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @Column(name = "record_deleted_at")
    private ZonedDateTime deletedAt;
}
