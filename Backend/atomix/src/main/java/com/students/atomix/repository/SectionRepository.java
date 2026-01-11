package com.students.atomix.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.students.atomix.model.Section;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
}
