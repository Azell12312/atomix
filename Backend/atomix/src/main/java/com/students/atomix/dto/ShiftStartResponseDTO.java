package com.students.atomix.dto;

public class ShiftStartResponseDTO {
    private Long shiftSessionId;

    public ShiftStartResponseDTO(Long shiftSessionId) {
        this.shiftSessionId = shiftSessionId;
    }

    public Long getShiftSessionId() {
        return shiftSessionId;
    }
}
