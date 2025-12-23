package com.students.atomix.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.students.atomix.model.ShiftSession;

@Repository
public interface ShiftSessionRepository
        extends JpaRepository<ShiftSession, Long> {
}
