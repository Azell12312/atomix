package com.students.atomix.dto;

import java.util.List;

public class ReportSaveRequestDTO {

    private Long shiftSessionId;
    private List<ItemValueDTO> items;

    public Long getShiftSessionId() {
        return shiftSessionId;
    }

    public void setShiftSessionId(Long shiftSessionId) {
        this.shiftSessionId = shiftSessionId;
    }

    public List<ItemValueDTO> getItems() {
        return items;
    }

    public void setItems(List<ItemValueDTO> items) {
        this.items = items;
    }
}
