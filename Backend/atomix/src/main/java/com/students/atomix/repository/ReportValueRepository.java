package com.students.atomix.repository;

import com.students.atomix.model.ReportValue;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReportValueRepository extends JpaRepository<ReportValue, Long> {

    Optional<ReportValue> findByShiftSessionIdAndItemInstanceId(Long shiftSessionId, Long itemInstanceId);
}
