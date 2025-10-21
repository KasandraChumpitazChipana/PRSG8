package pe.edu.vallegrande.vg_ms_fut.application.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.vallegrande.vg_ms_fut.application.service.IFutRequestService;
import pe.edu.vallegrande.vg_ms_fut.domain.model.FutRequest;
import pe.edu.vallegrande.vg_ms_fut.infraestructure.repository.FutRequestRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FutRequestServiceImpl implements IFutRequestService {

    private final FutRequestRepository repository;

    @Override
    public Mono<FutRequest> createRequest(FutRequest request) {
        request.setId(UUID.randomUUID().toString());
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
        return repository.save(request);
    }

    @Override
    public Mono<FutRequest> updateRequest(String id, FutRequest request) {
        return repository.findById(id)
                .flatMap(existing -> {
                    request.setId(existing.getId());
                    request.setCreatedAt(existing.getCreatedAt());
                    request.setUpdatedAt(LocalDateTime.now());
                    return repository.save(request);
                });
    }

    @Override
    public Mono<Void> deleteRequest(String id) {
        return repository.deleteById(id);
    }

    @Override
    public Mono<FutRequest> getRequestById(String id) {
        return repository.findById(id);
    }

    @Override
    public Flux<FutRequest> getAllRequests() {
        return repository.findAll();
    }

    @Override
    public Flux<FutRequest> searchByRequestSubject(String subject) {
        return repository.findByRequestSubjectContainingIgnoreCase(subject);
    }

    @Override
    public Flux<FutRequest> searchByStudentEnrollmentId(String studentEnrollmentId) {
        return repository.findByStudentEnrollmentId(studentEnrollmentId);
    }
}
