package pe.edu.vallegrande.vg_ms_fut.infraestructure.repository;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import pe.edu.vallegrande.vg_ms_fut.domain.model.FutRequest;
import reactor.core.publisher.Flux;

public interface FutRequestRepository extends ReactiveMongoRepository <FutRequest, String> {

    Flux<FutRequest> findByRequestSubjectContainingIgnoreCase(String requestSubject);
    Flux<FutRequest> findByStudentEnrollmentId(String studentEnrollmentId);
}
