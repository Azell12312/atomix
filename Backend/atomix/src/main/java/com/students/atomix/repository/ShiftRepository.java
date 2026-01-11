package com.students.atomix.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.students.atomix.model.Shift;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
}
