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

    @Column(name = "is_inventory", nullable = false)
    private boolean isInventory;

    @Column(name = "building_id")
    private Long buildingId;

    @Column(nullable = false)
    private boolean active;

    // getters / setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isInventory() {
        return isInventory;
    }

    public void setIsInventory(boolean inventory) {
        this.isInventory = inventory;
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
