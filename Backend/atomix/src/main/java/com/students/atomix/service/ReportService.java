package com.students.atomix.service;

import com.students.atomix.dto.ItemValueDTO;
import com.students.atomix.dto.ReportSaveRequestDTO;
import com.students.atomix.model.*;
import com.students.atomix.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

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
            ReportValueRepository valueRepository
    ) {
        this.shiftSessionRepository = shiftSessionRepository;
        this.templateRepository = templateRepository;
        this.instanceRepository = instanceRepository;
        this.valueRepository = valueRepository;
    }

    @Transactional
    public void saveReport(ReportSaveRequestDTO request) {

        ShiftSession session = shiftSessionRepository.findById(request.getShiftSessionId())
                .orElseThrow();

        if (session.getStatus() == ShiftStatus.CLOSED) {
            throw new RuntimeException("SHIFT_CLOSED");
        }

        LocalDate date = session.getShiftDate();
        Long sectionId = session.getSection().getId();

        for (ItemValueDTO item : request.getItems()) {

            ReportItemTemplate template;

            if (item.getTemplateId() != null) {
                template = templateRepository.findById(item.getTemplateId())
                        .orElseThrow();
            } else {
                template = new ReportItemTemplate();
                template.setTitle(item.getCustomTitle());
                template.setBuildingId(item.getBuildingId());
                template.setActive(false);
                template.setIsInventory(false);
                template = templateRepository.save(template);
            }

            ReportItemInstance instance = instanceRepository
                    .findByShiftDateAndSectionIdAndTemplateId(
                            date, sectionId, template.getId()
                    )
                    .orElseGet(() -> {
                        ReportItemInstance i = new ReportItemInstance();
                        i.setShiftDate(date);
                        i.setSectionId(sectionId);
                        i.setTemplate(template);
                        i.setOrderIndex(0);
                        return instanceRepository.save(i);
                    });

            ReportValue value = new ReportValue();
            value.setShiftSession(session);
            value.setItemInstance(instance);
            value.setValueNumber(item.getValueNumber());
            value.setValueText(item.getValueText());

            valueRepository.save(value);
        }
    }
}
