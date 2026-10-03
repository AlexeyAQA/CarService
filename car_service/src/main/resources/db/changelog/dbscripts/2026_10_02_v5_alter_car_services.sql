ALTER TABLE car_services
    ADD COLUMN performer_type VARCHAR(20);

UPDATE car_services
SET performer_type = 'SERVICE_CENTER'
WHERE service_center_id IS NOT NULL;

ALTER TABLE car_services
    ALTER COLUMN performer_type SET NOT NULL;

ALTER TABLE car_services
    ADD CONSTRAINT chk_car_services_performer_type
        CHECK (performer_type IN ('SELF', 'SERVICE_CENTER'));

ALTER TABLE car_services
    ADD CONSTRAINT chk_car_services_performer_center
        CHECK (
            (performer_type = 'SELF' AND service_center_id IS NULL)
                OR
            (performer_type = 'SERVICE_CENTER' AND service_center_id IS NOT NULL)
            );

ALTER TABLE car_services
    ALTER COLUMN service_date SET DATA TYPE DATE;