package pe.edu.vallegrande.vg_ms_fut.application.service;

import pe.edu.vallegrande.vg_ms_fut.domain.model.FutRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface IFutRequestService {

    Mono<FutRequest> createRequest(FutRequest request);
    Mono<FutRequest> updateRequest(String id, FutRequest request);
    Mono<Void> deleteRequest(String id);
    Mono<FutRequest> getRequestById(String id);
    Flux<FutRequest> getAllRequests();
    Flux<FutRequest> searchByRequestSubject(String subject);
    Flux<FutRequest> searchByStudentEnrollmentId(String studentEnrollmentId);
}
