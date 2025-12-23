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
import java.time.LocalDateTime;

@Entity
@Table(name = "shift_note")
public class ShiftNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "shift_session_id", nullable = false)
    public ShiftSession shiftSession;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public NoteType type;

    @Column(nullable = false)
    public String text;

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public ShiftSession getShiftSession() {
		return shiftSession;
	}

	public void setShiftSession(ShiftSession shiftSession) {
		this.shiftSession = shiftSession;
	}

	public NoteType getType() {
		return type;
	}

	public void setType(NoteType type) {
		this.type = type;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
