package pe.edu.vallegrande.vg_ms_fut.domain.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "fut_requests")
public class FutRequest {

    @Id
    private String id;
    private String studentEnrollmentId;
    private String requestNumber;
    private String requestType;
    private String requestSubject;
    private String requestDescription;
    private String requestedBy;
    private String contactPhone;
    private String contactEmail;
    private String urgencyLevel;
    private String estimatedDeliveryDate;
    private Map<String, Object> attachedDocuments;
    private String adminNotes;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
