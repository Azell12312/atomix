package com.students.atomix.dto;

public class ItemValueDTO {

	private Long templateId;
    private Long buildingId;      // или sectionId — по смыслу
    private String title;         // для временных строк
    private String unit;          // для временных строк
    private Double valueNumber;
    private String valueText;
    
    
    
	public Long getTemplateId() {
		return templateId;
	}
	public void setTemplateId(Long templateId) {
		this.templateId = templateId;
	}
	public Long getBuildingId() {
		return buildingId;
	}
	public void setBuildingId(Long buildingId) {
		this.buildingId = buildingId;
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
