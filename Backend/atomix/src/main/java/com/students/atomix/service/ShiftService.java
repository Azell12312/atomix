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

@Service // Сервис с логикой работы со сменами
public class ShiftService {

	private final ShiftSessionRepository shiftSessionRepository; // Сессии смен
	private final ShiftRepository shiftRepository; // Типы смен
	private final AppUserRepository userRepository; // Пользователи
	private final SectionRepository sectionRepository; // Участки / секции

	// Внедрение репозиториев
	public ShiftService(ShiftSessionRepository shiftSessionRepository, ShiftRepository shiftRepository,
			AppUserRepository userRepository, SectionRepository sectionRepository) {
		this.shiftSessionRepository = shiftSessionRepository;
		this.shiftRepository = shiftRepository;
		this.userRepository = userRepository;
		this.sectionRepository = sectionRepository;
	}

	@Transactional // Вся операция запуска смены — одна транзакция
	public ShiftStartResponseDTO startShift(ShiftStartRequestDTO dto) {

		// Проверяем, нет ли уже открытой смены у пользователя
		shiftSessionRepository
				.findTopByUserIdAndStatusOrderByStartedAtDesc(dto.getUserId(), ShiftStatus.OPEN)
				.ifPresent(s -> {
					throw new RuntimeException("SHIFT_ALREADY_OPEN");
				});

		// Получаем смену по id
		Shift shift = shiftRepository.findById(dto.getShiftId())
				.orElseThrow(() -> new RuntimeException("SHIFT_NOT_FOUND"));

		// Получаем пользователя
		AppUser user = userRepository.findById(dto.getUserId())
				.orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

		// Получаем секцию
		Section section = sectionRepository.findById(dto.getSectionId())
				.orElseThrow(() -> new RuntimeException("SECTION_NOT_FOUND"));

		// Создаём новую сессию смены
		ShiftSession session = new ShiftSession();
		session.setShiftDate(LocalDate.now()); // Дата смены
		session.setShift(shift);
		session.setUser(user);
		session.setSection(section);

		session.setStatus(ShiftStatus.OPEN); // Смена открыта
		session.setStartedAt(LocalDateTime.now()); // Время начала
		session.setClosedAt(null); // Время закрытия пока нет

		// Сохраняем сессию в БД
		session = shiftSessionRepository.save(session);

		// Возвращаем id созданной сессии
		return new ShiftStartResponseDTO(session.getId());
	}

	@Transactional // Закрытие смены
	public void closeShift(Long shiftSessionId) {

		// Ищем сессию по id
		ShiftSession session = shiftSessionRepository.findById(shiftSessionId)
				.orElseThrow(() -> new RuntimeException("SHIFT_SESSION_NOT_FOUND"));

		// Если смена уже закрыта — ничего не делаем
		if (session.getStatus() == ShiftStatus.CLOSED) {
			return;
		}

		// Закрываем смену
		session.setStatus(ShiftStatus.CLOSED);
		session.setClosedAt(LocalDateTime.now());

		// Сохраняем изменения
		shiftSessionRepository.save(session);
	}

}
