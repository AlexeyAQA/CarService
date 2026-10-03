CREATE TABLE maintenance_items
(
    id                    UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    maintenance_record_id UUID           NOT NULL,
    name                  VARCHAR(255)   NOT NULL,
    type                  VARCHAR(20)    NOT NULL,
    amount                DECIMAL(19, 2) NOT NULL,
    part_number           VARCHAR(100),
    position              INTEGER        NOT NULL,

    CONSTRAINT fk_maintenance_items_record
        FOREIGN KEY (maintenance_record_id) REFERENCES car_services (id),
    CONSTRAINT chk_maintenance_items_amount_non_negative
        CHECK (amount >= 0),
    CONSTRAINT chk_maintenance_items_position_non_negative
        CHECK (position >= 0),
    CONSTRAINT chk_maintenance_items_type
        CHECK (type IN ('WORK', 'PART')),
    CONSTRAINT chk_maintenance_items_part_number
        CHECK (type = 'PART' OR part_number IS NULL),
    CONSTRAINT uk_maintenance_items_record_position
        UNIQUE (maintenance_record_id, position)
);
