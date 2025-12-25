package com.students.atomix.dto;

import com.students.atomix.model.ReportItemTemplate;

public class ReportItemTemplateDTO {
    public Long id;
    public String title;
    public String unit;
    public Long buildingId;
    public Boolean isInventory;
    public boolean active;

    public static ReportItemTemplateDTO from(ReportItemTemplate t) {
        ReportItemTemplateDTO dto = new ReportItemTemplateDTO();
        dto.id = t.getId();
        dto.title = t.getTitle();
        dto.unit = t.getUnit();
        dto.buildingId = t.getBuildingId();
        dto.isInventory = t.getIsInventory();
        dto.active = t.isActive();
        return dto;
    }
}
