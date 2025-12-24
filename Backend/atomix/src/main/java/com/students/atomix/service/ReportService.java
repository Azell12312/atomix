package com.students.atomix.service;

import com.students.atomix.dto.ItemValueDTO;
import com.students.atomix.dto.ReportSaveRequestDTO;
import com.students.atomix.model.*;
import com.students.atomix.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class ReportService {

	private final ShiftSessionRepository shiftSessionRepository;
	private final ReportItemTemplateRepository templateRepository;
	private final ReportItemInstanceRepository instanceRepository;
	private final ReportValueRepository valueRepository;

	public ReportService(ShiftSessionRepository shiftSessionRepository, ReportItemTemplateRepository templateRepository,
			ReportItemInstanceRepository instanceRepository, ReportValueRepository valueRepository) {
		this.shiftSessionRepository = shiftSessionRepository;
		this.templateRepository = templateRepository;
		this.instanceRepository = instanceRepository;
		this.valueRepository = valueRepository;
	}

	@Transactional
	public void saveReport(ReportSaveRequestDTO request) {

	    ShiftSession session = shiftSessionRepository.findById(request.getShiftSessionId())
	            .orElseThrow(() -> new RuntimeException("SHIFT_SESSION_NOT_FOUND"));

	    if (session.getStatus() == ShiftStatus.CLOSED) {
	        throw new RuntimeException("SHIFT_CLOSED");
	    }

	    LocalDate date = session.getShiftDate();

	    for (ItemValueDTO item : request.getItems()) {

	        // 1) определяем sectionId (важно!)
	        Long sectionId = item.getBuildingId() != null
	                ? item.getBuildingId()
	                : session.getSection().getId();

	        // 2) находим/создаём template
	        ReportItemTemplate template = null;

	        if (item.getTemplateId() != null) {
	            template = templateRepository.findById(item.getTemplateId()).orElse(null);
	        }

	        // fallback: если templateId не совпадает, можно искать по title+building
	        if (template == null && item.getTitle() != null) {
	            template = templateRepository.findByTitleAndBuildingId(item.getTitle(), item.getBuildingId()).orElse(null);
	        }

	        // если это временная строка и шаблон всё равно не найден — создаём temp-template
	        if (template == null && item.getTitle() != null) {
	            template = new ReportItemTemplate();
	            template.setTitle("[TEMP] " + item.getTitle());
	            template.setUnit(item.getUnit());
	            template.setBuildingId(item.getBuildingId());
	            template.setIsInventory(false);
	            template.setActive(false);
	            template = templateRepository.save(template);
	        }

	        if (template == null) {
	            // шаблон неизвестен и title нет → просто пропускаем
	            continue;
	        }

	        // 3) находим/создаём instance
	        Optional<ReportItemInstance> existing =
	                instanceRepository.findByShiftDateAndSectionIdAndTemplateId(date, sectionId, template.getId());

	        ReportItemInstance instance;
	        if (existing.isPresent()) {
	            instance = existing.get();
	        } else {
	            ReportItemInstance inst = new ReportItemInstance();
	            inst.setShiftDate(date);
	            inst.setSectionId(sectionId);
	            inst.setTemplate(template);
	            inst.setOrderIndex(0);
	            instance = instanceRepository.save(inst);
	        }

	        // 4) UPSERT report_value
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
