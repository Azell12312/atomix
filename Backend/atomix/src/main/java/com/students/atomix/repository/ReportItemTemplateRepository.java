package com.students.atomix.repository;

import com.students.atomix.model.ReportItemTemplate;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportItemTemplateRepository
        extends JpaRepository<ReportItemTemplate, Long> {
	Optional<ReportItemTemplate> findByTitleAndBuildingId(String title, Long buildingId);

}
