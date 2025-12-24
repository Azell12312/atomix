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
import com.students.atomix.repository.ReportItemInstanceRepository;
import com.students.atomix.repository.ReportItemTemplateRepository;
import com.students.atomix.repository.ReportValueRepository;
import com.students.atomix.repository.ShiftSessionRepository;

@Service
public class ReportService {

    private final ShiftSessionRepository shiftSessionRepository;
    private final ReportItemTemplateRepository templateRepository;
    private final ReportItemInstanceRepository instanceRepository;
    private final ReportValueRepository valueRepository;

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

    @Transactional
    public void saveReport(ReportSaveRequestDTO request) {

        ShiftSession session = shiftSessionRepository.findById(request.getShiftSessionId())
                .orElseThrow(() -> new RuntimeException("SHIFT_SESSION_NOT_FOUND"));

        // shiftDate всегда берём из session
        LocalDate shiftDate = session.getShiftDate();

        for (ItemValueDTO item : request.getItems()) {

            // sectionId (пока используем buildingId как sectionId — как ты и описал)
            Long sectionId = item.getBuildingId() != null
                    ? item.getBuildingId()
                    : session.getSection().getId();

            // --- 1) TEMPLATE ---
            ReportItemTemplate template = null;

            // 1.1 попытка по id (если совпадает)
            if (item.getTemplateId() != null) {
                template = templateRepository.findById(item.getTemplateId()).orElse(null);
            }

            // 1.2 fallback если id не совпадает
            if (template == null && item.getTitle() != null && item.getBuildingId() != null) {
                template = templateRepository.findByTitleAndBuildingId(item.getTitle(), item.getBuildingId())
                        .orElse(null);
            }

            // 1.3 если это временная строка и template не найден — создаём temp template
            if (template == null && item.getTitle() != null) {
                template = new ReportItemTemplate();
                template.setTitle("[TEMP] " + item.getTitle());
                template.setUnit(item.getUnit());
                template.setBuildingId(item.getBuildingId());
                template.setIsInventory(false);
                template.setActive(false);
                template = templateRepository.save(template);
            }

            // если так и не нашли — пропускаем (нет возможности сохранить)
            if (template == null) {
                continue;
            }

            // --- 2) INSTANCE ---
            Optional<ReportItemInstance> existingInstance =
                    instanceRepository.findByShiftDateAndSectionIdAndTemplateId(shiftDate, sectionId, template.getId());

            ReportItemInstance instance;
            if (existingInstance.isPresent()) {
                instance = existingInstance.get();
            } else {
                ReportItemInstance inst = new ReportItemInstance();
                inst.setShiftDate(shiftDate);
                inst.setSectionId(sectionId);
                inst.setTemplate(template);
                inst.setOrderIndex(0);
                instance = instanceRepository.save(inst);
            }

            // --- 3) VALUE (UPSERT) ---
            ReportValue value = valueRepository
                    .findByShiftSessionIdAndItemInstanceId(session.getId(), instance.getId())
                    .orElseGet(ReportValue::new);

            value.setShiftSession(session);
            value.setItemInstance(instance);

            value.setValueNumber(item.getValueNumber());
            value.setValueText(item.getValueText());

            valueRepository.save(value);
        }
    }
}
