package com.students.atomix.model;

import jakarta.persistence.*;

@Entity
@Table(name = "report_item_template")
public class ReportItemTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String unit;

    @Column(name = "is_inventory")
    private Boolean isInventory;

    @Column(name = "building_id")
    private Long buildingId;

    private boolean active = true;

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Boolean getIsInventory() {
        return isInventory;
    }

    public void setIsInventory(Boolean isInventory) {
        this.isInventory = isInventory;
    }

    public Long getBuildingId() {
        return buildingId;
    }

    public void setBuildingId(Long buildingId) {
        this.buildingId = buildingId;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
