package pe.edu.vallegrande.vg_ms_fut.application.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pe.edu.vallegrande.vg_ms_fut.domain.model.FutRequest;
import pe.edu.vallegrande.vg_ms_fut.infraestructure.repository.FutRequestRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class FutRequestServiceImplTest {

    @Mock
    private FutRequestRepository repository;

    @InjectMocks
    private FutRequestServiceImpl service;

    private FutRequest request;

    @BeforeEach
    void setUp() {
        request = new FutRequest();
        request.setId(UUID.randomUUID().toString());
        request.setRequestSubject("Cambio de turno");
        request.setStudentEnrollmentId("ST123");
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    void createRequest_ShouldSaveSuccessfully() {
        when(repository.save(any(FutRequest.class))).thenReturn(Mono.just(request));

        StepVerifier.create(service.createRequest(request))
                .expectNextMatches(saved -> saved.getRequestSubject().equals("Cambio de turno"))
                .verifyComplete();

        verify(repository).save(any(FutRequest.class));
    }

    @Test
    void updateRequest_ShouldUpdateSuccessfully() {
        when(repository.findById(eq(request.getId()))).thenReturn(Mono.just(request));
        when(repository.save(any(FutRequest.class))).thenReturn(Mono.just(request));

        StepVerifier.create(service.updateRequest(request.getId(), request))
                .expectNextMatches(updated -> updated.getId().equals(request.getId()))
                .verifyComplete();

        verify(repository).findById(request.getId());
        verify(repository).save(any(FutRequest.class));
    }

    @Test
    void deleteRequest_ShouldDeleteSuccessfully() {
        when(repository.deleteById(eq(request.getId()))).thenReturn(Mono.empty());

        StepVerifier.create(service.deleteRequest(request.getId()))
                .verifyComplete();

        verify(repository).deleteById(request.getId());
    }

    @Test
    void getRequestById_ShouldReturnRequest() {
        when(repository.findById(eq(request.getId()))).thenReturn(Mono.just(request));

        StepVerifier.create(service.getRequestById(request.getId()))
                .expectNext(request)
                .verifyComplete();

        verify(repository).findById(request.getId());
    }

    @Test
    void getAllRequests_ShouldReturnAll() {
        when(repository.findAll()).thenReturn(Flux.just(request));

        StepVerifier.create(service.getAllRequests())
                .expectNext(request)
                .verifyComplete();

        verify(repository).findAll();
    }

    @Test
    void searchByRequestSubject_ShouldReturnMatchingRequests() {
        when(repository.findByRequestSubjectContainingIgnoreCase(eq("cambio")))
                .thenReturn(Flux.just(request));

        StepVerifier.create(service.searchByRequestSubject("cambio"))
                .expectNext(request)
                .verifyComplete();

        verify(repository).findByRequestSubjectContainingIgnoreCase("cambio");
    }

    @Test
    void searchByStudentEnrollmentId_ShouldReturnMatchingRequests() {
        when(repository.findByStudentEnrollmentId(eq("ST123"))).thenReturn(Flux.just(request));

        StepVerifier.create(service.searchByStudentEnrollmentId("ST123"))
                .expectNext(request)
                .verifyComplete();

        verify(repository).findByStudentEnrollmentId("ST123");
    }
}
