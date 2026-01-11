package com.students.atomix.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.students.atomix.dto.ItemValueDTO;
import com.students.atomix.dto.ReportSaveRequestDTO;
import com.students.atomix.model.ReportItemInstance;
import com.students.atomix.model.ReportItemTemplate;
import com.students.atomix.model.ReportValue;
import com.students.atomix.model.ShiftSession;
import com.students.atomix.model.ShiftStatus;
import com.students.atomix.repository.ReportItemInstanceRepository;
import com.students.atomix.repository.ReportItemTemplateRepository;
import com.students.atomix.repository.ReportValueRepository;
import com.students.atomix.repository.ShiftSessionRepository;

@Service // Сервис с логикой сохранения отчёта
public class ReportService {

    private final ShiftSessionRepository shiftSessionRepository; // Работа со сменами
    private final ReportItemTemplateRepository templateRepository; // Шаблоны отчёта
    private final ReportItemInstanceRepository instanceRepository; // Экземпляры пунктов
    private final ReportValueRepository valueRepository; // Значения пунктов

    // Внедрение репозиториев
    public ReportService(
            ShiftSessionRepository shiftSessionRepository,
            ReportItemTemplateRepository templateRepository,
            ReportItemInstanceRepository instanceRepository,
            ReportValueRepository valueRepository) {
        this.shiftSessionRepository = shiftSessionRepository;
        this.templateRepository = templateRepository;
        this.instanceRepository = instanceRepository;
        this.valueRepository = valueRepository;
    }

    @Transactional // Все операции выполняются одной транзакцией
    public void saveReport(ReportSaveRequestDTO request) {

        // Получаем смену по id
        ShiftSession session = shiftSessionRepository.findById(request.getShiftSessionId())
                .orElseThrow(() -> new RuntimeException("SHIFT_SESSION_NOT_FOUND"));

        // Если смена закрыта — запрещаем сохранение
        if (session.getStatus() == ShiftStatus.CLOSED) {
            throw new RuntimeException("SHIFT_CLOSED");
        }
        
        // Дата смены берётся из самой смены
        LocalDate shiftDate = session.getShiftDate();

        // Проходим по всем пунктам отчёта
        for (ItemValueDTO item : request.getItems()) {

            // Определяем sectionId
            Long sectionId = item.getBuildingId() != null
                    ? item.getBuildingId()
                    : session.getSection().getId();

            // --- 1) TEMPLATE ---
            ReportItemTemplate template = null;

            // Пытаемся найти шаблон по id
            if (item.getTemplateId() != null) {
                template = templateRepository.findById(item.getTemplateId()).orElse(null);
            }

            // Если не нашли — ищем по названию и зданию
            if (template == null && item.getTitle() != null && item.getBuildingId() != null) {
                template = templateRepository.findByTitleAndBuildingId(item.getTitle(), item.getBuildingId())
                        .orElse(null);
            }

            // Если шаблон временный — создаём новый
            if (template == null && item.getTitle() != null) {
                template = new ReportItemTemplate();
                template.setTitle("[TEMP] " + item.getTitle());
                template.setUnit(item.getUnit());
                template.setBuildingId(item.getBuildingId());
                template.setIsInventory(false);
                template.setActive(false);
                template = templateRepository.save(template);
            }

            // Если шаблон так и не найден — пропускаем пункт
            if (template == null) {
                continue;
            }

            // --- 2) INSTANCE ---
            Optional<ReportItemInstance> existingInstance =
                    instanceRepository.findByShiftDateAndSectionIdAndTemplateId(
                            shiftDate, sectionId, template.getId());

            ReportItemInstance instance;
            if (existingInstance.isPresent()) {
                // Используем существующий экземпляр
                instance = existingInstance.get();
            } else {
                // Создаём новый экземпляр
                ReportItemInstance inst = new ReportItemInstance();
                inst.setShiftDate(shiftDate);
                inst.setSectionId(sectionId);
                inst.setTemplate(template);
                inst.setOrderIndex(0);
                instance = instanceRepository.save(inst);
            }

            // --- 3) VALUE ---
            // Ищем значение или создаём новое
            ReportValue value = valueRepository
                    .findByShiftSessionIdAndItemInstanceId(session.getId(), instance.getId())
                    .orElseGet(ReportValue::new);

            // Заполняем данные значения
            value.setShiftSession(session);
            value.setItemInstance(instance);
            value.setValueNumber(item.getValueNumber());
            value.setValueText(item.getValueText());

            // Сохраняем значение
            valueRepository.save(value);
        }
    }
}
