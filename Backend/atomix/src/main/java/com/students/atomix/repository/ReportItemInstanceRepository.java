package com.students.atomix.repository;

import com.students.atomix.model.ReportItemInstance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ReportItemInstanceRepository extends JpaRepository<ReportItemInstance, Long> {

	Optional<ReportItemInstance> findByShiftDateAndSectionIdAndTemplateId(LocalDate shiftDate, Long sectionId,
			Long templateId);
}
