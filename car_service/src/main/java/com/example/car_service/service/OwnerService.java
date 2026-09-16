package com.example.car_service.service;

import com.example.car_service.domain.dto.owner.*;
import com.example.car_service.exception.OwnerBusinessException;
import com.example.car_service.exception.OwnerConflictException;
import com.example.car_service.exception.OwnerNotFoundException;

import java.util.UUID;

/**
 * Управляет владельцами автомобилей: созданием, поиском, обновлением, удалением и восстановлением.
 * Чтение и обновление доступны только для активных владельцев.
 * Валидация входных DTO выполняется контроллером до вызова сервиса.
 */
public interface OwnerService {

    /**
     * Создаёт активного владельца без связанных автомобилей.
     *
     * @param request ФИО, телефон и email владельца, прошедшие валидацию
     * @return сохранённый владелец с идентификатором и датами создания и обновления
     * @throws OwnerBusinessException если при сохранении произошла ошибка доступа к БД
     */
    OwnerResponse create(OwnerCreateRequest request);

    /**
     * Возвращает активного владельца и его автомобили.
     *
     * @param id идентификатор владельца
     * @return данные владельца
     * @throws OwnerNotFoundException если владелец отсутствует или мягко удалён
     */
    OwnerResponse findById(UUID id);

    /**
     * Ищет активных владельцев с фильтрацией, сортировкой и пагинацией.
     * Удалённые записи исключаются из результата и общего количества элементов.
     * Границы дат независимы и включают указанные календарные дни в часовом поясе сервера.
     *
     * @param filter проверенные условия поиска и параметры страницы; нумерация страниц начинается с нуля
     * @return страница владельцев, её номер и размер, общее количество элементов и страниц
     */
    OwnerPageResponse findWithFilter(OwnerSearchRequest filter);

    /**
     * Частично обновляет ФИО, телефон и email активного владельца.
     * Поля со значением {@code null} сохраняют прежние значения; очистить поле через {@code null} нельзя.
     * Связи с автомобилями не изменяются.
     *
     * @param id идентификатор владельца
     * @param updatedOwner новые значения полей, прошедшие валидацию
     * @return владелец после сохранения изменений
     * @throws OwnerNotFoundException если владелец отсутствует или мягко удалён
     */
    OwnerResponse updateOwnerById(UUID id, OwnerUpdateRequest updatedOwner);

    /**
     * Физически удаляет активного или мягко удалённого владельца без связанных автомобилей.
     * После этой операции восстановление невозможно.
     *
     * @param id идентификатор владельца
     * @throws OwnerNotFoundException если запись владельца отсутствует
     * @throws OwnerConflictException если у владельца есть связанные автомобили
     */
    void hardDeleteOwnerById(UUID id);

    /**
     * Помечает активного владельца без связанных автомобилей как удалённого.
     * Запись сохраняется в БД и может быть восстановлена через {@link #restoreOwner(UUID)}.
     *
     * @param id идентификатор владельца
     * @throws OwnerNotFoundException если запись владельца отсутствует
     * @throws OwnerConflictException если владелец уже удалён или у него есть связанные автомобили
     */
    void softDeleteOwnerById(UUID id);

    /**
     * Восстанавливает мягко удалённого владельца, делая его доступным для чтения, поиска и обновления.
     *
     * @param uuid идентификатор владельца
     * @throws OwnerNotFoundException если запись владельца отсутствует, в том числе после физического удаления
     * @throws OwnerConflictException если владелец уже активен
     */
    void restoreOwner(UUID uuid);
}
