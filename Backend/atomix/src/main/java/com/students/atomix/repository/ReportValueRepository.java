package com.students.atomix.repository;

import com.students.atomix.model.ReportValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportValueRepository
        extends JpaRepository<ReportValue, Long> {
}
