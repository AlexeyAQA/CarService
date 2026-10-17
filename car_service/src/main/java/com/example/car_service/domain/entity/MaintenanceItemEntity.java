package com.example.car_service.domain.entity;

import com.example.car_service.domain.enums.MaintenanceItemType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "maintenance_items")
public class MaintenanceItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "maintenance_record_id", nullable = false)
    private MaintenanceRecordEntity maintenanceRecord;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private MaintenanceItemType type;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "part_number")
    private String partNumber;

    @Column(name = "position", nullable = false)
    private Integer position;

}
