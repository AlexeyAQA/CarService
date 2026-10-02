package com.example.car_service.domain.entity;

import com.example.car_service.domain.enums.PerformerType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "car_services")
public class MaintenanceRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "car_id", nullable = false)
    private CarEntity car;

    @ManyToOne
    @JoinColumn(name = "service_center_id")
    private ServiceCenterEntity serviceCenter;

    @OneToMany(
            mappedBy = "maintenanceRecord",
            cascade = {CascadeType.PERSIST, CascadeType.REMOVE}
    )
    @OrderBy("position ASC")
    private List<MaintenanceItemEntity> items = new ArrayList<>();

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "mileage")
    private Integer mileage;

    @Enumerated(EnumType.STRING)
    @Column(name = "performer_type", nullable = false)
    private PerformerType performerType;

    @Column(name = "description")
    private String description;

    @Column(name = "cost")
    private BigDecimal cost;

    @CreationTimestamp
    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}