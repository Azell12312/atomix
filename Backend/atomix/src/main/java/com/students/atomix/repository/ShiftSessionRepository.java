package com.students.atomix.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.students.atomix.model.ShiftSession;
import com.students.atomix.model.ShiftStatus;

@Repository
public interface ShiftSessionRepository extends JpaRepository<ShiftSession, Long> {
	Optional<ShiftSession> findTopByUserIdAndStatusOrderByStartedAtDesc(Long userId, ShiftStatus status);
}
