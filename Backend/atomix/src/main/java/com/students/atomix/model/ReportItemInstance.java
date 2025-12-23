package com.students.atomix.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
    name = "report_item_instance",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"shift_date", "section_id", "template_id"}
    )
)
public class ReportItemInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;

    @Column(name = "section_id", nullable = false)
    private Long sectionId;

    @ManyToOne
    @JoinColumn(name = "template_id", nullable = false)
    private ReportItemTemplate template;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    // getters / setters

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

    public Long getSectionId() {
        return sectionId;
    }

    public void setSectionId(Long sectionId) {
        this.sectionId = sectionId;
    }

    public ReportItemTemplate getTemplate() {
        return template;
    }

    public void setTemplate(ReportItemTemplate template) {
        this.template = template;
    }

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }
}
