package com.students.atomix.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "shift_session")
public class ShiftSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "shift_date", nullable = false)
    public LocalDate shiftDate;

    @ManyToOne
    @JoinColumn(name = "shift_id", nullable = false)
    public Shift shift;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public AppUser user;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    public Section section;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public ShiftStatus status;

    @Column(name = "started_at", nullable = false)
    public LocalDateTime startedAt;

    @Column(name = "closed_at")
    public LocalDateTime closedAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public LocalDate getShiftDate() {
		return shiftDate;
	}

	public void setShiftDate(LocalDate shiftDate) {
		this.shiftDate = shiftDate;
	}

	public Shift getShift() {
		return shift;
	}

	public void setShift(Shift shift) {
		this.shift = shift;
	}

	public AppUser getUser() {
		return user;
	}

	public void setUser(AppUser user) {
		this.user = user;
	}

	public Section getSection() {
		return section;
	}

	public void setSection(Section section) {
		this.section = section;
	}

	public ShiftStatus getStatus() {
		return status;
	}

	public void setStatus(ShiftStatus status) {
		this.status = status;
	}

	public LocalDateTime getStartedAt() {
		return startedAt;
	}

	public void setStartedAt(LocalDateTime startedAt) {
		this.startedAt = startedAt;
	}

	public LocalDateTime getClosedAt() {
		return closedAt;
	}

	public void setClosedAt(LocalDateTime closedAt) {
		this.closedAt = closedAt;
	}
}