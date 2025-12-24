package com.students.atomix.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.students.atomix.dto.ShiftStartRequestDTO;
import com.students.atomix.dto.ShiftStartResponseDTO;
import com.students.atomix.model.AppUser;
import com.students.atomix.model.Section;
import com.students.atomix.model.Shift;
import com.students.atomix.model.ShiftSession;
import com.students.atomix.model.ShiftStatus;
import com.students.atomix.repository.AppUserRepository;
import com.students.atomix.repository.SectionRepository;
import com.students.atomix.repository.ShiftRepository;
import com.students.atomix.repository.ShiftSessionRepository;

@Service
public class ShiftService {

    private final ShiftSessionRepository shiftSessionRepository;
    private final ShiftRepository shiftRepository;
    private final AppUserRepository userRepository;
    private final SectionRepository sectionRepository;

    public ShiftService(
            ShiftSessionRepository shiftSessionRepository,
            ShiftRepository shiftRepository,
            AppUserRepository userRepository,
            SectionRepository sectionRepository) {
        this.shiftSessionRepository = shiftSessionRepository;
        this.shiftRepository = shiftRepository;
        this.userRepository = userRepository;
        this.sectionRepository = sectionRepository;
    }

    @Transactional
    public ShiftStartResponseDTO startShift(ShiftStartRequestDTO dto) {

        Shift shift = shiftRepository.findById(dto.getShiftId())
                .orElseThrow(() -> new RuntimeException("SHIFT_NOT_FOUND"));

        AppUser user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        Section section = sectionRepository.findById(dto.getSectionId())
                .orElseThrow(() -> new RuntimeException("SECTION_NOT_FOUND"));

        ShiftSession session = new ShiftSession();
        session.setShiftDate(LocalDate.now());
        session.setShift(shift);
        session.setUser(user);
        session.setSection(section);

        session.setStatus(ShiftStatus.OPEN);
        session.setStartedAt(LocalDateTime.now());
        session.setClosedAt(null);

        session = shiftSessionRepository.save(session);

        return new ShiftStartResponseDTO(session.getId());
    }
}
