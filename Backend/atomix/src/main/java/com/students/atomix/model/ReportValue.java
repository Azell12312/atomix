package com.students.atomix.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "report_value")
public class ReportValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne
    @JoinColumn(name = "shift_session_id", nullable = false)
    public ShiftSession shiftSession;

    @ManyToOne
    @JoinColumn(name = "item_instance_id", nullable = false)
    public ReportItemInstance itemInstance;

    @Column(name = "value_number")
    public Double valueNumber;

    @Column(name = "value_text")
    public String valueText;

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

	public ReportItemInstance getItemInstance() {
		return itemInstance;
	}

	public void setItemInstance(ReportItemInstance itemInstance) {
		this.itemInstance = itemInstance;
	}

	public Double getValueNumber() {
		return valueNumber;
	}

	public void setValueNumber(Double valueNumber) {
		this.valueNumber = valueNumber;
	}

	public String getValueText() {
		return valueText;
	}

	public void setValueText(String valueText) {
		this.valueText = valueText;
	}
}